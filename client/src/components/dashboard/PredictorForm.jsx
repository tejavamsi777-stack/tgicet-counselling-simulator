import { motion } from "framer-motion";
import { Search } from "lucide-react";
import Card from "../ui/Card";
import Input from "../ui/Input";
import Select from "../ui/Select";
import Button from "../ui/Button";

const CATEGORIES = ["OC", "BC-A", "BC-B", "BC-C", "BC-D", "BC-E", "SC", "ST"];
const GENDERS = ["Male", "Female"];
const COURSES = ["MBA", "MCA"];

export default function PredictorForm({
  rank,
  setRank,
  category,
  setCategory,
  gender,
  setGender,
  course,
  setCourse,
  onPredict,
  error,
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      id="predict"
    >
      <Card className="
p-8
rounded-[32px]
bg-white/70
backdrop-blur-2xl
border border-white/50
shadow-[0_20px_60px_rgba(37,99,235,0.12)]
">
        <h2 className="text-xl font-semibold tracking-tight text-slate-900">
          Predict Your College
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Enter your details to see eligible colleges based on previous year cutoffs.
        </p>

        <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <>
  <Input
    id="rank"
    label="TG ICET Rank"
    type="number"
    placeholder="e.g. 12500"
    value={rank}
    onChange={(e) => {
      setRank(e.target.value);
    }}
  />

  {error && (
    <p className="text-red-600 text-sm mt-2 font-medium">
      {error}
    </p>
  )}
</>
          <Select
            id="category"
            label="Category"
            options={CATEGORIES}
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          />
          <Select
            id="gender"
            label="Gender"
            options={GENDERS}
            value={gender}
            onChange={(e) => setGender(e.target.value)}
          />
          <Select
            id="course"
            label="Course"
            options={COURSES}
            value={course}
            onChange={(e) => setCourse(e.target.value)}
          />
        </div>

        <div className="mt-6">
          <Button size="lg" onClick={onPredict} className="w-full">
            <Search size={16} />
            Predict College
          </Button>
        </div>
      </Card>
    </motion.div>
  );
}