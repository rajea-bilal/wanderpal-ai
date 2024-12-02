import { NextResponse } from "next/server";

// IMPORTANT! Set the runtime to edge
export const runtime = "edge";

export async function POST(req: Request, res: Response) {
  // Extract the `prompt` from the body of the request
  console.log("POST request received at /api/endpoint");
  // Log raw body
  console.log("Raw request body:", req.body);
  const { prompt } = await req.json();
  console.log("Extracted prompt", prompt);

  try {
    const payload = {
      version:
        "2b017d9b67edd2ee1401238df49d75da53c523f36e363881e057f5dc3ed3c5b2",
      input: {
        prompt: `${prompt}`,
      },
    };

    console.log("Payload being sent to Replicate API:", payload);

    const response = await fetch("https://api.replicate.com/v1/predictions", {
      method: "POST",
      headers: {
        Authorization: `Token ${process.env.REPLICATE_API_TOKEN}`,
        "Content-Type": "application/json",
      },
      // body: JSON.stringify({
      //   // See https://replicate.com/stability-ai/sdxl
      //   version:
      //     "2b017d9b67edd2ee1401238df49d75da53c523f36e363881e057f5dc3ed3c5b2",
      //   input: {
      //     prompt: `${prompt}, anime, high detail, Studio Ghibli style, cel shading`,
      //   },
      // }),
      body: JSON.stringify(payload),
    });

    console.log("Response status from Replicate API:", response.status);

    if (response.status !== 201) {
      let error = await response.json();
      throw new Error(
        `HTTP error! status: ${response.status} | detail: ${error.detail}`
      );
    }

    let prediction = await response.json();

    while (
      prediction.status !== "succeeded" &&
      prediction.status !== "failed"
    ) {
      await new Promise((resolve) => {
        setTimeout(resolve, 1000);
      });
      try {
        const response = await fetch(
          "https://api.replicate.com/v1/predictions/" + prediction.id,
          {
            headers: {
              Authorization: `Token ${process.env.REPLICATE_API_TOKEN}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (response.status !== 200) {
          let error = await response.json();
          throw new Error(
            `HTTP error! status: ${response.status} | detail: ${error.detail}`
          );
        }

        prediction = await response.json();
      } catch (error) {
        console.log(error);
      }
    }
    const imageUrl = prediction.output[prediction.output.length - 1];
    console.log("Final image URL:", imageUrl);
    return NextResponse.json({ imageUrl });
  } catch (error: any) {
    console.error(error);
    return new Response(error?.message || error?.toString(), {
      status: 500,
    });
  }
}
