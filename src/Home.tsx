import React, { useState } from "react";
import axios from "axios";
import { Button, Form, Input, message, Table } from "antd";

const GenerateQuestionsPage = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(false);

  interface Question {
    question: string;
    correct_answer: string;
    incorrect_answers: string[];
  }

  interface FetchQuestionsResponse {
    status: string;
    faqs: {
      question: string;
      right_answer: string;
      wrong_answer_1: string;
      wrong_answer_2: string;
      wrong_answer_3: string;
    }[];
  }

  interface FormValues {
    knowledge_scope: string;
    num_questions: number;
  }

  const fetchQuestions = async (values: FormValues) => {
    setLoading(true);
    try {
      const response = await axios.post<FetchQuestionsResponse>("/api/faq/create_and_save_faq/", {
        knowledge_scope: values.knowledge_scope,
        num_questions: parseInt(values.num_questions.toString(), 10),
      });

      if (response.data.status === "success" && response.data.faqs) {
        const fetchedQuestions: Question[] = response.data.faqs.map((faq) => ({
          question: faq.question,
          correct_answer: faq.right_answer,
          incorrect_answers: [
            faq.wrong_answer_1,
            faq.wrong_answer_2,
            faq.wrong_answer_3,
          ],
        }));

        setQuestions(fetchedQuestions);
        message.success("Questions generated successfully!");
      } else {
        message.error("Failed to generate questions. Using default questions.");
        setQuestions(loadDefaultQuestions());
      }
    } catch (error) {
      console.error(error);
      message.error("An error occurred. Using default questions.");
      setQuestions(loadDefaultQuestions());
    } finally {
      setLoading(false);
    }
  };

  const loadDefaultQuestions = () => [
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
  ];

  interface Column {
    title: string;
    dataIndex: string;
    key: string;
    render?: (answers: string[]) => string;
  }

  const columns: Column[] = [
    {
      title: "Question",
      dataIndex: "question",
      key: "question",
    },
    {
      title: "Correct Answer",
      dataIndex: "correct_answer",
      key: "correct_answer",
    },
    {
      title: "Incorrect Answers",
      dataIndex: "incorrect_answers",
      key: "incorrect_answers",
      render: (answers: string[]) => answers.join(", "),
    },
  ];

  return (
    <div>
      <h1>Generate Questions</h1>
      <Form
        layout="vertical"
        onFinish={fetchQuestions}
        initialValues={{ knowledge_scope: "", num_questions: 5 }}
      >
        <Form.Item
          label="Knowledge Scope"
          name="knowledge_scope"
          rules={[{ required: true, message: "Please enter the knowledge scope!" }]}
        >
          <Input placeholder="Enter knowledge scope" />
        </Form.Item>
        <Form.Item
          label="Number of Questions"
          name="num_questions"
          rules={[{ required: true, message: "Please enter the number of questions!" }]}
        >
          <Input type="number" placeholder="Enter number of questions" />
        </Form.Item>
        <Button type="primary" htmlType="submit" loading={loading}>
          Generate Questions
        </Button>
      </Form>

      {questions.length > 0 && (
        <div style={{ marginTop: "20px" }}>
          <h2>Generated Questions</h2>
          <Table dataSource={questions} columns={columns} rowKey="question" />
        </div>
      )}
    </div>
  );
};

export default GenerateQuestionsPage;
