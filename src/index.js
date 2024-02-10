import { Ai } from "@cloudflare/ai";
import { Hono } from "hono";

import health from "./health.html";
import sports from "./sports.html";
import finance from "./finance.html";
import energy from "./energy.html";
import image from "./image.html";

const app = new Hono();

app.get("/", (c) => c.html(health));
app.get("/b", (c) => c.html(sports))
app.get("/c", (c) => c.html(finance))
app.get("/d", (c) => c.html(energy))
app.get("/e", (c) => c.html(image))

app.get("/health", async (c) => {
	const ai = new Ai(c.env.AI);
	const query = c.req.query("query");
	const question = query || "What is the square root of 9?";
  
	const stream = await ai.run(
	  "@cf/meta/llama-2-7b-chat-int8",
	  {
		messages: [
		  { role: "system", content: `You are a Paramedic.` },
		  { role: "user", content: question },
		],
		stream: true,
	  },
	);
	return new Response(stream, {
	  headers: {
		"content-type": "text/event-stream",
	  },
	});
  });


  app.get("/sports", async (c) => {
	const ai = new Ai(c.env.AI);
	const query = c.req.query("query");
	const question = query || "What is the square root of 9?";
  
	const stream = await ai.run(
	  "@hf/thebloke/neural-chat-7b-v3-1-awq",
	  {
		messages: [
		  { role: "system", content: `You are a Sports analyst.` },
		  { role: "user", content: question },
		],
		stream: true,
	  },
	);
	return new Response(stream, {
	  headers: {
		"content-type": "text/event-stream",
	  },
	});
  });

  app.get("/finance", async (c) => {
	const ai = new Ai(c.env.AI);
	const query = c.req.query("query");
	const question = query || "What is the square root of 9?";
  
	const stream = await ai.run(
	  "@hf/thebloke/deepseek-coder-6.7b-instruct-awq",
	  {
		messages: [
		  { role: "system", content: `You are a Financial Educator.` },
		  { role: "user", content: question },
		],
		stream: true,
	  },
	);
	return new Response(stream, {
	  headers: {
		"content-type": "text/event-stream",
	  },
	});
  });


  app.get("/energy", async (c) => {
	const ai = new Ai(c.env.AI);
	const query = c.req.query("query");
	const question = query || "What is the square root of 9?";
  
	const stream = await ai.run(
	  "@cf/mistral/mistral-7b-instruct-v0.1",
	  {
		messages: [
		  { role: "system", content: `You are a sustainability expert.` },
		  { role: "user", content: question },
		],
		stream: true,
	  },
	);
	return new Response(stream, {
	  headers: {
		"content-type": "text/event-stream",
	  },
	});
  });

  // Function to process image using Cloudflare AI
async function processImage(ai, imageBuffer) {
	const inputs = {
	  image: [...new Uint8Array(imageBuffer)],
	};
  
	const response = await ai.run('@cf/microsoft/resnet-50', inputs);
	return response;
  }
  

  // Route for processing uploaded images
app.post("/classify-and-generate", async (c) => {
	const ai = new Ai(c.env.AI);
  
	try {
	  const formData = await c.req.formData();
	  const imageFile = formData.get("image");
  
	  if (!imageFile) {
		return c.json({ error: "No image uploaded" });
	  }
  
	  const imageBuffer = await imageFile.arrayBuffer();
	  const imageProcessingResult = await processImage(ai, imageBuffer);

	  // Initialize variables to hold the highest score and label
       let highestScore = -1;
       let highestLabel = "";

      // Iterate through each item in the imageProcessingResult array
       for (const result of imageProcessingResult) {
      // Check if the current score is higher than the previous highest score
       if (result.score > highestScore) {
          // Update the highest score and label
          highestScore = result.score;
          highestLabel = result.label;
       }
       }

	  return  c.json({ highestLabel});
	} catch (error) {
	  console.error('Error processing uploaded image:', error);
	  return c.json({ error: 'Error processing uploaded image' });
	}
  });



  app.onError((err, c) => {
	return c.text(err);
  });

  export default app;
