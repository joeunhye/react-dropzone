import React, {useCallback, useEffect, useState} from 'react';
import {useDropzone} from 'react-dropzone';
const btn = {
    background: '#7900ff',
    padding: '15px 25px',
    borderRadius: '5px',
    border: 'none',
    color: '#fff',
    fontSize: '1rem',
    cursor: 'pointer'
}

const container = {
    width: '1000px',
    margin: '0 auto'
}
const dropzone = {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '20px',
    borderWidth: '2px',
    borderRadius: '2px',
    borderColor: '#eeeeee',
    borderStyle: 'dashed',
    backgroundColor: '#fafafa',
    color: '#bdbdbd',
    outline: 'none',
    transition: 'border .24s ease-in-out'
}
const thumbsContainer = {
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 16
};
  
const thumb = {
    display: 'inline-flex',
    borderRadius: 2,
    border: '1px solid #eaeaea',
    marginBottom: 8,
    marginRight: 8,
    width: 100,
    height: 100,
    padding: 4,
    boxSizing: 'border-box'
};
  
const thumbInner = {
    display: 'flex',
    minWidth: 0,
    overflow: 'hidden'
};
  
const img = {
    display: 'block',
    width: 'auto',
    height: '100%'
};

function Dropzone(props) {
    const [files, setFiles] = useState([]);
    const [imgUrls, setImgUrls] = useState([])
    const [uploadCheck, setUploadCheck] = useState(false)
    const {getRootProps, getInputProps, isDragActive} = useDropzone({
        accept: {
          'image/*': []
        },
        onDrop: acceptedFiles => {
          setFiles(acceptedFiles.map(file => Object.assign(file, {
            preview: URL.createObjectURL(file)
          })));
        }
    });

    console.log(imgUrls);
    
    const thumbs = files.map(file => (
        <div style={thumb} key={file.name}>
            <div style={thumbInner}>
                <img
                    src={file.preview}
                    style={img}
                    // Revoke data uri after image is loaded
                    onLoad={() => { URL.revokeObjectURL(file.preview) }}
                    alt='' />
            </div>
        </div>
    ));

    useEffect(() => {
        // Make sure to revoke the data uris to avoid memory leaks, will run on unmount
        return () => files.forEach(file => URL.revokeObjectURL(file.preview));
    }, [files]);

    const handleUpload = async () =>  {
        const url = `https://api.cloudinary.com/v1_1/${process.env.REACT_APP_CLOUDINARY_NAME}/image/upload`;
        const formData = new FormData();

        for(let i = 0; i < files.length; i++) {
            let file = files[i];
            formData.append("file", file);
            formData.append("upload_preset", process.env.REACT_APP_UPLOAD_PRESET);
            await fetch(url, {
                method: "POST",
                body: formData
            })
            .then((response) => {
                return response.json();
            })
            .then((data) => {
                setUploadCheck(true)
                setTimeout(() => {
                    setUploadCheck(false)
                }, 1000)
                setImgUrls(prev => [...prev, data.url])
            });
        }
    }

    return (
        <section style={container}>
            <div {...getRootProps()} style={dropzone}>
                <input {...getInputProps()} />
                <p>Drag 'n' drop some files here, or click to select files</p>
            </div>
            <aside style={thumbsContainer}>
                {thumbs}
            </aside>
            {uploadCheck && <p>업로드 완료 👍</p>}
            {files.length > 0 && <button style={btn} onClick={handleUpload}>Upload</button>}
            {imgUrls.length > 0 && 
                <div>
                    <h2>My Background</h2>
                    <ul>
                        {imgUrls.map((img, idx) => <li key={idx}><img src={img} alt="" /></li>)}
                    </ul>
                </div>
            }
            
        </section>
    );
}

export default Dropzone;