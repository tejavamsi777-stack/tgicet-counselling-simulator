import { referenceService } from "../src/services/referenceService.js";

async function testRef() {
  const years = await referenceService.getYears("tg-eapcet");
  const courses = await referenceService.getCourses("tg-eapcet");
  console.log("TG EAPCET Years count:", years.length, years);
  console.log("TG EAPCET Courses count:", courses.length, courses.slice(0, 5));
}

testRef();
