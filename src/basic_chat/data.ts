import OpenAI from "openai";

const openai = new OpenAI();

const createEmbedding = async (input: string | string[]) => {
    const response = await openai.embeddings.create({
        model: "text-embedding-3-small",
        input
    })

    console.log(response.data[0].embedding);

}

createEmbedding("Hello world! into vectorization");


