import React from 'react';
import styles from './ImgList.module.scss'

const ImgList = ({file, onDelete}) => {
    const handleDelete = () => {
		onDelete(file);
	};
    return (
        <li><img src={file.secure_url} alt="" /><button className={styles.imgRemove} onClick={handleDelete}>X</button></li>
    );
};

export default ImgList;