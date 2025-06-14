import React, { useState } from 'react';
import axios from 'axios';

function UploadExcel() {
  const [file, setFile] = useState(null);

  const uploadFile = async () => {
    const formData = new FormData();
    formData.append('file', file);
    await axios.post('http://localhost:5000/api/marks/upload', formData);
    alert("Upload success");
  };

  return (
    <div>
      <h2>Upload Student Marks Excel</h2>
      <input type="file" onChange={e => setFile(e.target.files[0])} />
      <button onClick={uploadFile}>Upload</button>
    </div>
  );
}

export default UploadExcel;
