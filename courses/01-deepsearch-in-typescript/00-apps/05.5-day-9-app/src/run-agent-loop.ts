import { SystemContext, type SearchResult } from "./system-context";
import { getNextAction } from "./get-next-action";
import { searchSerper } from "./serper";
import { bulkCrawlWebsites } from "./server/scraper";
import { streamText, type StreamTextResult, type Message } from "ai";
import { model } from "~/model";
import { answerQuestion } from "./answer-question";
import type { OurMessageAnnotation } from "./types";

export async function runAgentLoop(
  messages: Message[],
  opts: {
    langfuseTraceId?: string;
    writeMessageAnnotation?: (annotation: OurMessageAnnotation) => void;
    onFinish: Parameters<typeof streamText>[0]["onFinish"];
  },
): Promise<StreamTextResult<{}, string>> {
  // A persistent container for the state of our system
  const ctx = new SystemContext(messages);

  // A loop that continues until we have an answer
  // or we've taken 10 actions
  while (!ctx.shouldStop()) {
    // We choose the next action based on the state of our system
    const nextAction = await getNextAction(ctx, opts);

    // Send the action as an annotation if writeMessageAnnotation is provided
    if (opts.writeMessageAnnotation) {
      opts.writeMessageAnnotation({
        type: "NEW_ACTION",
        action: nextAction,
      });
    }

    // We execute the action and update the state of our system
    if (nextAction.type === "search") {
      if (!nextAction.query) {
        throw new Error("Query is required for search action");
      }
      // Fetch top 3 results
      const results = await searchSerper(
        { q: nextAction.query, num: 3 },
        undefined,
      );
      const organicResults = results.organic.slice(0, 3);
      const searchResultUrls = organicResults.map((result) => result.link);
      // Scrape all URLs in parallel
      const scrapeResults = await bulkCrawlWebsites({ urls: searchResultUrls });
      // Map scraped content to search results
      const searchResults: SearchResult[] = organicResults.map((result, i) => ({
        date: result.date || new Date().toISOString(),
        title: result.title,
        url: result.link,
        snippet: result.snippet,
        scrapedContent: scrapeResults.results[i]?.result.success
          ? scrapeResults.results[i].result.data
          : "[Failed to scrape]",
      }));
      ctx.reportSearch({
        query: nextAction.query,
        results: searchResults,
      });
    } else if (nextAction.type === "answer") {
      return answerQuestion(ctx, { isFinal: false, ...opts });
    }

    // We increment the step counter
    ctx.incrementStep();
  }

  // If we've taken 10 actions and haven't answered yet,
  // we ask the LLM to give its best attempt at an answer
  return answerQuestion(ctx, { isFinal: true, ...opts });
}
