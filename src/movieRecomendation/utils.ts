import OpenAI from "openai";
import { readFileSync, writeFileSync } from "fs";

const openai = new OpenAI();
type Movie = {
    title: string;
    year: number;
    genre: string;
    director: string;
    rating: number;
    short_description: string;
};

const moviesJson = readFileSync(new URL("./movies.json", import.meta.url), "utf-8");
const movies: Movie[] = JSON.parse(moviesJson);
const inputs: string[] = movies.map(
    (m) =>
        `Title: ${m.title}. Year: ${m.year}. Genre: ${m.genre}. Director: ${m.director}. Rating: ${m.rating}. Summary: ${m.short_description}`
);
export const createEmbeddingAndSave = async () => {
    const response = await openai.embeddings.create({
        model: "text-embedding-3-small",
        input: inputs
    })

    const movieVectors: {
        title: string;
        embedding: number[];
    }[] = [];

    response.data.forEach((embedding, index) => {
        movieVectors.push({
            title: movies[index].title,
            embedding: embedding.embedding
        })
    })

    writeFileSync(new URL("./movieVectors.json", import.meta.url), JSON.stringify(movieVectors, null, 2));
}

export const cosineSimilarity = (vecA: number[], vecB: number[]) => {
    const dotProduct = vecA.reduce((acc, val, i) => acc + val * vecB[i], 0);
    const magnitudeA = Math.sqrt(vecA.reduce((acc, val) => acc + val * val, 0));
    const magnitudeB = Math.sqrt(vecB.reduce((acc, val) => acc + val * val, 0));
    return dotProduct / (magnitudeA * magnitudeB);
}

export const findClosestMovies = (
    inputEmbedding: number[],
    movieVectors: { title: string; embedding: number[] }[]
) => {
    return movieVectors
        .map((movie) => ({
            title: movie.title,
            similarity: cosineSimilarity(inputEmbedding, movie.embedding)
        }))
        .sort((a, b) => b.similarity - a.similarity)
        .slice(0, 3);
}
