import React, { useState, useEffect } from "react";
import { Card, Radio, Button, Tag, message } from "antd";
import * as XLSX from "xlsx";
import axios from "axios";

const Quiz: React.FC = () => {
  const [quizData, setQuizData] = useState<any[]>([]);
  const [userAnswers, setUserAnswers] = useState<{ [key: number]: string }>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [scorePercent, setScorePercent] = useState<number | null>(null);

  useEffect(() => {
    // Fetch quiz data from the API
    const fetchQuizData = async () => {
      try {
        const response = await axios.post("/api/faq/create_and_save_faq/", {
          knowledge_scope: "",
          num_questions: 5,
        });

        if (response.data.status === "success" && response.data.faqs) {
          const faqs = response.data.faqs.map((faq: any) => ({
            question: faq.question,
            correct_answer: faq.right_answer,
            incorrect_answers: [
              faq.wrong_answer_1,
              faq.wrong_answer_2,
              faq.wrong_answer_3,
            ],
          }));

          const shuffledData = faqs.map((item: any) => ({
            ...item,
            options: [item.correct_answer, ...item.incorrect_answers].sort(() => Math.random() - 0.5),
          }));
          setQuizData(shuffledData);
        } else {
          message.error("Failed to load quiz data. Loading default questions.");
          setQuizData(loadDefaultQuestions());
        }
      } catch (error) {
        console.error(error);
        message.error("An error occurred while fetching quiz data. Loading default questions.");
        setQuizData(loadDefaultQuestions());
      }
    };

    const loadDefaultQuestions = () => {
      const defaultQuestions = [
        // Default questions as provided
        {
          question: "Hiệp định sơ bộ được ký kết giữa chính phủ Việt Nam và Pháp vào ngày tháng năm nào?",
          correct_answer: "06/3/1946",
          incorrect_answers: ["14/9/1946", "26/11/1953", "21/7/1954"],
        },
        {
          question: "Hội nghị Giơnevơ được triệu tập để giải quyết vấn đề nào?",
          correct_answer: "Triều Tiên và lập lại hòa bình ở Đông Dương",
          incorrect_answers: [
            "Chấm dứt chiến tranh ở Việt Nam",
            "Thống nhất đất nước Việt Nam",
            "Giải quyết xung đột giữa các nước lớn",
          ],
        },
        // Additional questions...
      ];

      return defaultQuestions.map((item) => ({
        ...item,
        options: [item.correct_answer, ...item.incorrect_answers].sort(() => Math.random() - 0.5),
      }));
    };


    fetchQuizData();
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
      "STT": (index + 1).toString(),
      "Nội dung câu hỏi": item.question,
      "Đáp án đã chọn": userAnswers[index] || "Chưa trả lời",
      "Kết quả": userAnswers[index] === item.correct_answer ? "Đúng" : "Sai",
    }));

    exportData.push({
      "STT": "Summary",
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
