import { readFile } from "fs/promises";
import { createEmbeddingAndSave, findClosestMovies } from "./utils.ts";
import OpenAI from "openai";
const openai = new OpenAI();

type MovieVector = {
    title: string;
    embedding: number[];
};

const loadMovieVectors = async (): Promise<MovieVector[]> => {
    const movieVectorsPath = new URL("./movieVectors.json", import.meta.url);

    try {
        const fileContents = await readFile(movieVectorsPath, "utf-8");
        return JSON.parse(fileContents) as MovieVector[];
    } catch (error) {
        if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
            throw error;
        }

        await createEmbeddingAndSave();
        const fileContents = await readFile(movieVectorsPath, "utf-8");
        return JSON.parse(fileContents) as MovieVector[];
    }
};

async function main() {
    const movieVectors = await loadMovieVectors();

    console.log("Welcome to the Movie Recommendation System!");
    console.log("Please enter a movie title or description to get recommendations:");

    process.stdin.addListener('data', async (input) => {
        const trimmedInput: string = input.toString().trim();
        const response = await openai.embeddings.create({
            model: "text-embedding-3-small",
            input: trimmedInput
        });
        const inputEmbedding: number[] = response.data[0].embedding;
        const similarMovies = findClosestMovies(inputEmbedding, movieVectors);
        console.log("Top Movie Recommendations:");
        similarMovies.forEach((movie, index) => {
            console.log(`${index + 1}. ${movie.title} (Similarity: ${movie.similarity.toFixed(2)})`);
        });
    })
}

main();
