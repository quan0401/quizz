import React, { useState, useEffect } from "react";
import { Card, Radio, Button, Tag, message } from "antd";
import * as XLSX from "xlsx";

const Quiz: React.FC = () => {
  const dummyData = [
    {
      question: "What is the title of the budget document presented to the House of Commons by Finance Minister Chrystia Freeland on March 28, 2023?",
      correct_answer: "2023 Canadian federal budget",
      incorrect_answers: ["2023 Canadian Economic Action Plan", "2023-2024 Fiscal Year Report", "Budget of the Canadian Federal Government 2023"],
    },
    {
      question: "What is the fiscal year covered by the 2023 Canadian federal budget?",
      correct_answer: "April 1, 2023 - March 31, 2024",
      incorrect_answers: ["April 1, 2022 - March 31, 2023", "January 1, 2023 - December 31, 2023", "July 1, 2023 - June 30, 2024"],
    },
  ];

  const [quizData, setQuizData] = useState<any[]>([]);
  const [userAnswers, setUserAnswers] = useState<{ [key: number]: string }>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [scorePercent, setScorePercent] = useState<number | null>(null);

  useEffect(() => {
    const shuffledData = dummyData.map((item) => ({
      ...item,
      options: [item.correct_answer, ...item.incorrect_answers].sort(() => Math.random() - 0.5),
    }));
    setQuizData(shuffledData);
  }, []);

  const handleAnswerChange = (questionIndex: number, value: string) => {
    setUserAnswers((prev) => ({ ...prev, [questionIndex]: value }));
  };

  const handleSubmit = () => {
    if (Object.keys(userAnswers).length < quizData.length) {
      message.warning("Please answer all questions before submitting!");
      return;
    }
    setIsSubmitted(true);
    const correctCount = quizData.reduce(
      (count, item, index) => count + (userAnswers[index] === item.correct_answer ? 1 : 0),
      0
    );
    const percentage = Math.round((correctCount / quizData.length) * 100);
    setScorePercent(percentage);
    message.success(`You scored ${percentage}%!`);
  };

  const exportEntireQuiz = () => {
    const exportData = quizData.map((item, index) => ({
      "STT": index + 1,
      "Nội dung câu hỏi": item.question,
      "Đáp án A": item.options[0],
      "Đáp án B": item.options[1],
      "Đáp án C": item.options[2],
      "Đáp án D": item.options[3],
      "Đáp án đúng": item.correct_answer,
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Quiz Data");
    XLSX.writeFile(workbook, "QuizData_Entire.xlsx");
  };

  const exportUserChoices = () => {
    if (!isSubmitted) {
      message.warning("Please submit your answers before exporting!");
      return;
    }

    const exportData = quizData.map((item, index) => ({
      "STT": index + 1,
      "Nội dung câu hỏi": item.question,
      "Đáp án đã chọn": userAnswers[index] || "Chưa trả lời",
      "Kết quả": userAnswers[index] === item.correct_answer ? "Đúng" : "Sai",
    }));

    exportData.push({
      "STT": "Tổng kết",
      "Nội dung câu hỏi": "",
      "Đáp án đã chọn": "",
      "Kết quả": `Điểm số: ${scorePercent}%`,
    });

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "User Choices");
    XLSX.writeFile(workbook, "QuizData_UserChoices.xlsx");
  };

  return (
    <div style={{ maxWidth: 800, margin: "0 auto" }}>
      <Button type="primary" style={{ marginBottom: 16, marginRight: 8 }} onClick={exportEntireQuiz}>
        Export Entire Quiz
      </Button>
      <Button type="primary" style={{ marginBottom: 16 }} onClick={exportUserChoices}>
        Export User Choices
      </Button>
      {quizData.map((item, index) => (
        <Card key={index} title={`Question ${index + 1}`} style={{ marginBottom: 16 }}>
          <p>{item.question}</p>
          <Radio.Group
            onChange={(e) => handleAnswerChange(index, e.target.value)}
            value={userAnswers[index]}
            disabled={isSubmitted}
          >
            {item.options.map((option: any, optIndex: any) => (
              <Radio
                key={optIndex}
                value={option}
                style={{
                  backgroundColor: isSubmitted && option === item.correct_answer ? "#d4edda" : "transparent",
                  borderRadius: "5px",
                  padding: "2px 5px",
                }}
              >
                {option}
              </Radio>
            ))}
          </Radio.Group>
          {isSubmitted && (
            <div style={{ marginTop: 8 }}>
              <Tag
                color={userAnswers[index] === item.correct_answer ? "green" : "red"}
                style={{ fontWeight: "bold" }}
              >
                {userAnswers[index] === item.correct_answer ? "Correct" : `Correct Answer: ${item.correct_answer}`}
              </Tag>
            </div>
          )}
        </Card>
      ))}
      <Button
        type="primary"
        onClick={handleSubmit}
        style={{ marginTop: 16 }}
        disabled={isSubmitted}
      >
        Submit
      </Button>
      {isSubmitted && scorePercent !== null && (
        <div style={{ marginTop: 16, fontSize: "1.2rem", fontWeight: "bold" }}>
          You scored: {scorePercent}%
        </div>
      )}
    </div>
  );
};

export default Quiz;
