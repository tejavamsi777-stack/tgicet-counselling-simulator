import { predictionService } from "../src/services/predictionService.js";

async function testPredict() {
  const results = await predictionService.predict({
    rank: 312,
    category: "BC_B",
    gender: "Male",
    course: "CSE",
    year: 2025,
    exam: "tg-eapcet",
  });
  console.log("TG EAPCET Predict Results Count:", results.length);
}

testPredict();
