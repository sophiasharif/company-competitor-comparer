// app/api/findcompetitors/route.ts
import { NextRequest, NextResponse } from 'next/server';
import Exa from "exa-js";

export const maxDuration = 60;

const exa = new Exa(process.env.EXA_API_KEY as string);

export async function POST(req: NextRequest) {
  try {
    const { websiteurl, summaryText } = await req.json();
    console.log('websiteurl', websiteurl);
    console.log('summaryText', summaryText);
    if (!websiteurl || !summaryText) {
      return NextResponse.json({ error: 'Website URL and summary text are required' }, { status: 400 });
    }

    // Use Exa to search for content related to the claim
    const result = await exa.searchAndContents(
      summaryText,
      {
        type: "neural",
        useAutoprompt: true,
        text: true,
        summary: {
            query: `Explain in one/two lines what does this company do in simple english. Don't use any diffcult words.`
          },
        livecrawl: "always",
        excludeDomains: [websiteurl]
      }
    );

    console.log('result.results', result.results);

    return NextResponse.json({ results: result.results });
  } catch (error) {
    return NextResponse.json({ error: `Failed to perform search | ${error}` }, { status: 500 });
  }
}