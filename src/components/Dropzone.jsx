import React, { useCallback, useEffect, useState } from "react";
import axios from "axios";

import { useDropzone } from "react-dropzone";
const btn = {
	background: "#7900ff",
	padding: "15px 25px",
	borderRadius: "5px",
	border: "none",
	color: "#fff",
	fontSize: "1rem",
	cursor: "pointer",
};

const container = {
	width: "1000px",
	margin: "0 auto",
};
const dropzone = {
	flex: 1,
	display: "flex",
	flexDirection: "column",
	alignItems: "center",
	padding: "20px",
	marginBottom: "20px",
	borderWidth: "2px",
	borderRadius: "2px",
	borderColor: "#eeeeee",
	borderStyle: "dashed",
	backgroundColor: "#fafafa",
	color: "#bdbdbd",
	outline: "none",
	transition: "border .24s ease-in-out",
};
const thumbsContainer = {
	display: "flex",
	flexDirection: "row",
	flexWrap: "wrap",
	marginTop: 16,
};

const thumb = {
	position: "relative",
	display: "inline-flex",
	borderRadius: 2,
	border: "1px solid #eaeaea",
	marginBottom: 8,
	marginRight: 8,
	width: 100,
	height: 100,
	padding: 4,
	boxSizing: "border-box",
};

const thumbInner = {
	display: "flex",
	minWidth: 0,
	overflow: "hidden",
};

const img = {
	display: "block",
	width: "90px",
	height: "100%",
	objectFit: "cover",
};

const remove = {
	position: "absolute",
	right: "-5px",
	top: "-5px",
	background: "#eb3c30",
	borderRadius: "50%",
	color: "#fff",
	border: "none",
	fontSize: "20px",
	width: "20px",
	height: "20px",
	display: "flex",
	alignItems: "center",
	justifyContent: "center",
};

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

	const removeFile = file => () => {
		const newFiles = [...files];
		newFiles.splice(newFiles.indexOf(file), 1);
		setFiles(newFiles);
	};

	const thumbs = files.map(file => (
		<div style={thumb} key={file.name}>
			<div style={thumbInner}>
				<img
					src={file.preview}
					style={img}
					// Revoke data uri after image is loaded
					onLoad={() => {
						URL.revokeObjectURL(file.preview);
					}}
					alt=""
				/>
			</div>
			<button onClick={removeFile(file)} style={remove}>
				-
			</button>
		</div>
	));

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
		<section style={container}>
			<div {...getRootProps()} style={dropzone}>
				<input {...getInputProps()} />
				<p>Drag 'n' drop some files here, or click to select files</p>
			</div>
			<aside style={thumbsContainer}>{thumbs}</aside>

			{loading && <p>업로드 중</p>}
			{uploadCheck && <p>업로드 완료 👍</p>}
			{files.length > 0 && (
				<button style={btn} onClick={handleUpload}>
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
