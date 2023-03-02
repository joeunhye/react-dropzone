import React, { useCallback, useEffect, useState } from "react";
import axios from "axios";
import styles from './Dropzone.module.scss'
import { useDropzone } from "react-dropzone";
import Thumbs from "./Thumbs";

function Dropzone() {
	const getBg = () => {
		const bgimgs = localStorage.getItem("bg");
		return bgimgs ? JSON.parse(bgimgs) : [];
	};
	const [files, setFiles] = useState([]);
	const [localFiles, setlocalFiles] = useState(getBg);
	const [loading, setLoading] = useState(false);
	const [uploadCheck, setUploadCheck] = useState(false);

	const onDrop = useCallback(acceptedFiles => {
		setFiles(
			acceptedFiles.map(file =>
				Object.assign(file, {
					preview: URL.createObjectURL(file),
				})
			)
		);
	}, []);

	const { getRootProps, getInputProps } = useDropzone({
		accept: {
			"image/*": [],
		},
		onDrop,
	});

	

	// const thumbs = files.map(file => (
	// 	<div style={thumb} key={file.name}>
	// 		<div style={thumbInner}>
	// 			<img
	// 				src={file.preview}
	// 				style={img}
	// 				// Revoke data uri after image is loaded
	// 				onLoad={() => {
	// 					URL.revokeObjectURL(file.preview);
	// 				}}
	// 				alt=""
	// 			/>
	// 		</div>
	// 		<button onClick={removeFile(file)} style={remove}>
	// 			-
	// 		</button>
	// 	</div>
	// ));

	useEffect(() => {
		localStorage.setItem("bg", JSON.stringify(localFiles));
		// Make sure to revoke the data uris to avoid memory leaks, will run on unmount
		return () => files.forEach(file => URL.revokeObjectURL(file.preview));
	}, [files, localFiles]);

	const handleUpload = async () => {
		setLoading(true);
		const url = `https://api.cloudinary.com/v1_1/${process.env.REACT_APP_CLOUDINARY_NAME}/image/upload`;
		const uploaders = files.map(async file => {
			const formData = new FormData();
			const config = {
				header: {
					"content-type": "multipart/form-data",
				},
			};
			formData.append("file", file);
			formData.append("upload_preset", process.env.REACT_APP_UPLOAD_PRESET);

			try {
				await axios
					.post(url, formData, config) //
					.then(response => {
						setlocalFiles(prev => [...prev, response.data.secure_url]);
						console.log(response.data);
						localStorage.setItem("bg", JSON.stringify(localFiles));
					});
			} catch (error) {
				console.error(error);
			}
		});

		axios.all(uploaders).then(() => {
			setUploadCheck(true);
			setLoading(false);
			setTimeout(() => {
				setUploadCheck(false);
			}, 1000);
			setFiles([]);
		});
	};
	console.log(localFiles);
	return (
		<section className={styles.container}>
			<div {...getRootProps()} className={styles.dropzone}>
				<input {...getInputProps()} />
				<p>Drag 'n' drop some files here, or click to select files</p>
			</div>
			<aside className={styles.thumbsContainer}>
                {
                    files.map(file => <Thumbs file={file} files={files} key={file.name} setFiles={setFiles} />)
                }
            </aside>

			{loading && <p>업로드 중</p>}
			{uploadCheck && <p>업로드 완료 👍</p>}
			{files.length > 0 && (
				<button className={styles.btn} onClick={handleUpload}>
					Upload
				</button>
			)}
			{localFiles.map((el, idx) => (
				<img src={el} key={idx} alt="" />
			))}
		</section>
	);
}

export default Dropzone;
