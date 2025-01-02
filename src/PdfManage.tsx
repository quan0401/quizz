import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Table, Button, message } from 'antd';

const PdfManagementPage = () => {
  const [pdfFiles, setPdfFiles] = useState<PdfFile[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchPdfFiles = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/file_manager/get_files/');
      if (response.data.status === 'success') {
        setPdfFiles(response.data.files);
      } else {
        message.error('Failed to load PDF files.');
      }
    } catch (error) {
      console.error(error);
      message.error('An error occurred while fetching PDF files.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPdfFiles();
  }, []);

  interface PdfFile {
    _id: string;
    filename: string;
    upload_date: string;
  }

  const handleDelete = async (fileId: string) => {
    try {
      const response = await axios.delete<{ status: string }>(`/api/file_manager/delete_file/${fileId}`);
      if (response.data.status === 'success') {
        message.success('File deleted successfully.');
        setPdfFiles(pdfFiles.filter((file: PdfFile) => file._id !== fileId));
      } else {
        message.error('Failed to delete file.');
      }
    } catch (error) {
      console.error(error);
      message.error('An error occurred while deleting the file.');
    }
  };

  interface Column {
    title: string;
    dataIndex?: string;
    key: string;
    render?: (text: string, record: PdfFile) => JSX.Element | string;
  }

  const columns: Column[] = [
    {
      title: 'File Name',
      dataIndex: 'filename',
      key: 'filename',
    },
    {
      title: 'Upload Date',
      dataIndex: 'upload_date',
      key: 'upload_date',
      render: (text: string) => new Date(text).toLocaleString(),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record: PdfFile) => (
        <Button type="default" onClick={() => handleDelete(record._id)}>
          Delete
        </Button>
      ),
    },
  ];

  return (
    <div>
      <h1>Manage Uploaded PDFs</h1>
      <Table
        columns={columns}
        dataSource={pdfFiles.map((file) => ({ ...file, key: file._id }))}
        loading={loading}
      />
    </div>
  );
};

export default PdfManagementPage;
