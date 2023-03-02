import React from 'react';
import styles from './Thumbs.module.scss';

const Thunbs = ({file, files, setFiles}) => {
	const removeFile = file => () => {
		const newFiles = [...files];
		newFiles.splice(newFiles.indexOf(file), 1);
		setFiles(newFiles);
	};

    return (
        <div className={styles.thumb} key={file.name}>
			<div className={styles.thumbInner}>
				<img
					src={file.preview}
					className={styles.img}
					// Revoke data uri after image is loaded
					onLoad={() => {
						URL.revokeObjectURL(file.preview);
					}}
					alt=""
				/>
			</div>
			<button onClick={removeFile(file)} className={styles.remove}>
				-
			</button>
		</div>
    );
};

export default Thunbs;