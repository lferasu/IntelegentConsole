import OpenAI from "openai";
import { readFileSync, writeFileSync } from "fs";
import { join } from "path";

const openai = new OpenAI();
type Movie = {
    title: string;
    year: number;
    genre: string;
    director: string;
    rating: number;
    short_description: string;
};

function loadJSONData<T>(fileName: string): T {
    const path = join(__dirname, fileName);
    const rawData = readFileSync(path);
    return JSON.parse(rawData.toString()) as T;
}

const movies = loadJSONData<Movie[]>("movies.json");
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

    writeFileSync(join(__dirname, "movieVectors.json"), JSON.stringify(movieVectors, null, 2));
}

export const findClosestMovies = (queryEmbedding: number[], movieVectors: { title: string; embedding: number[] }[], topK: number = 5) => {
    const similarities = movieVectors.map(movie => ({
        title: movie.title,
        similarity: cosineSimilarity(queryEmbedding, movie.embedding)
    }));
    similarities.sort((a, b) => b.similarity - a.similarity);
    return similarities.slice(0, topK);
}

export const cosineSimilarity = (vecA: number[], vecB: number[]) => {
    const dotProduct = vecA.reduce((acc, val, i) => acc + val * vecB[i], 0);
    const magnitudeA = Math.sqrt(vecA.reduce((acc, val) => acc + val * val, 0));
    const magnitudeB = Math.sqrt(vecB.reduce((acc, val) => acc + val * val, 0));
    return dotProduct / (magnitudeA * magnitudeB);
}
