import { predictionService } from "../src/services/predictionService.js";

async function testPredict() {
  try {
    const results = await predictionService.predict({
      rank: 512,
      category: "OC",
      gender: "Male",
      course: "CS",
      year: 2025,
      exam: "tg-polycet",
    });
    console.log("TG POLYCET Predictor Results Count:", results.length);
    console.log("First 3 predicted colleges:", results.slice(0, 3));
  } catch (err) {
    console.error("Predict test error:", err);
  }
}

testPredict();
