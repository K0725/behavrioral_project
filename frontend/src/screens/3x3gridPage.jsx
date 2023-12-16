import React from 'react';
import { target_images, non_target_images } from '../components/Image';
import { getNextRoundImages } from '../functions/getNextRound';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { addData } from '../slices/ExcelSlice';

const ThreegridPage = () => {
	const dispatch = useDispatch();
	const navigate = useNavigate();
	const [imagesState, setImages] = useState([]);
	const [trialNumber, setTrialNumber] = useState(1);
	const [targetIndex, setTargetIndex] = useState();
	const [selectedImagesArray, setSelectedImagesArray] = useState([]);
	const [attempts, setAttempts] = useState(1);
	// const [loading, setLoading] = useState(true);
	const [loadedImagesCount, setLoadedImagesCount] = useState(0);

	let start = new Date().getTime();

	useEffect(() => {
		const subscribe = async () => {
			let images = [];
			// let targetIndex = Math.floor(Math.random() * 9);
			let targetIndex = 0;
			setTargetIndex(0); // randomly select the index of the target image
			for (let i = 0; i < 8; i++) {
				let image = non_target_images[i];
				images.push(image);
			}

			images.push(target_images[targetIndex]);
			return images;
		};

		subscribe().then((images) => {  //execute only one time
			shuffleArray(images).then((shuffledImages) => {
				// console.log('shuffled images', shuffledImages);
				// console.log("updated");
				setImages(shuffledImages); // final array
				
			});
		});
	}, []);

	async function handleClickImage(image) {
		if (image?.category === 'non-target') {
			setAttempts(attempts + 1);
			setSelectedImagesArray((selectedImagesArray) => [
				...selectedImagesArray,
				image?.index,
			]);
		} else if (image?.category === 'target') {
			let startIndex = targetIndex + 8; // 0+8 = 9, 17
			let endIndex = startIndex + 8;

			setSelectedImagesArray([]);
			

			const end = new Date().getTime();
			const TimeTaken = end - start;
			start = 0;
			
			// get next round images

			let nextRoundImages = getNextRoundImages(
				startIndex,
				endIndex,
				non_target_images
			);
			nextRoundImages.push(target_images[targetIndex + 1]);
			
			setTargetIndex(targetIndex + 1);
			const shuffeledImages = await shuffleArray(nextRoundImages);
			
			setImages(shuffeledImages);
			setAttempts(attempts + 1);

			

			dispatch(
				addData({
					trial: trialNumber,
					attempts: attempts,
					time: TimeTaken / 100,
				})
			);
			if (trialNumber === 3) {
				navigate(`/nextPage`);
			} else {				
				setAttempts(1);
				setTrialNumber(trialNumber + 1);
			}
		}
	}

	async function shuffleArray(array) {
		let shuffledArray = array.slice(); // make a copy of the array
		for (let i = shuffledArray.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * i);
			const temp = shuffledArray[i];
			shuffledArray[i] = shuffledArray[j];
			shuffledArray[j] = temp;
		}
		return shuffledArray;
	}

	return (
		<div className="container">
		  <div className="headerText">Practice Trial 3x3 Grid</div>
	
		  {loadedImagesCount < imagesState.length && (
			<div className="loading-message">Loading images, please wait...</div>
		  )}
		  <div className="image-grid">
			{imagesState.map((image, key) => {
			  return (
				<div
				  className="grid-item"
				  key={key}
				  onClick={() => handleClickImage(image)}
				>
				  <img
					src={image?.image}
					width="120px"
					height="120px"
					alt={image?.index}
					style={{
					  opacity:
						selectedImagesArray.includes(image?.index) &&
						image?.category === 'non-target'
						  ? 0
						  : 1,
					  display: loadedImagesCount < imagesState.length ? 'none' : 'inline',
					}}
					onLoad={() => {
					  setLoadedImagesCount((prevCount) => prevCount + 1);
					}}
				  />
				</div>
			  );
			})}
		  </div>
		</div>
	  );
	};
	
	export default ThreegridPage;