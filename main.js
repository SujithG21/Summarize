// const ffmpeg = require('fluent-ffmpeg');
// const { AssemblyAI } = require('assemblyai');
// const fs = require('fs');

// // Function to convert video to audio
// const convertVideoToAudio = (inputVideo, outputAudio) => {
//     return new Promise((resolve, reject) => {
//         ffmpeg(inputVideo)
//             .noVideo() // no video output
//             .audioCodec('libmp3lame') // library that converts to mp3
//             .save(outputAudio)
//             .on('end', () => {
//                 console.log('Conversion complete');
//                 resolve(outputAudio);
//             })
//             .on('error', (err) => {
//                 console.error('Error converting video to audio:', err);
//                 reject(err);
//             });
//     });
// };

// // Function to transcribe audio to text
// const transcribeAudioToText = async (audioUrl) => {
//     const client = new AssemblyAI({ apiKey: "4b1bb8144f1d4ba19a12430eb772cedd"});//"sk-proj-eCSXduVL9IGfqMHnTaz0T3BlbkFJz04F0w4q4IYesdJ57EPe" }); 
//     const config = { audio_url: audioUrl };

//     try {
//         const transcript = await client.transcripts.create(config);
//         return transcript.text;
//     } catch (error) {
//         console.error('Error transcribing audio to text:', error);
//         throw error;
//     }
// };

// // Function to calculate similarity between two texts
// const calculateSimilarity = async (text1, text2) => {
//     const distance = levenshteinDistance(text1, text2);
//     const maxLength = Math.max(text1.length, text2.length);
//     const similarityPercentage = ((maxLength - distance) / maxLength) * 100;
//     return similarityPercentage.toFixed(2);
// };

// // Function to read text from a file
// const readFile = (filePath) => {
//     return new Promise((resolve, reject) => {
//         fs.readFile(filePath, 'utf8', (err, data) => {
//             if (err) {
//                 reject(err);
//             } else {
//                 resolve(data);
//             }
//         });
//     });
// };

// // Function to calculate Levenshtein distance
// const levenshteinDistance = (str1, str2) => {
//     // Implementation of Levenshtein distance...
//     const m = str1.length;
//     const n = str2.length;
//     const dp = Array.from(Array(m + 1), () => Array(n + 1).fill(0));

//     for (let i = 0; i <= m; i++) {
//         for (let j = 0; j <= n; j++) {
//             if (i === 0) {
//                 dp[i][j] = j;
//             } else if (j === 0) {
//                 dp[i][j] = i;
//             } else if (str1[i - 1] === str2[j - 1]) {
//                 dp[i][j] = dp[i - 1][j - 1];
//             } else {
//                 dp[i][j] = 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
//             }
//         }
//     }

//     return dp[m][n];

// };

// // Main function to integrate all functionalities
// const main = async (inputVideo, textFilePath) => {
//     try {
//         const outputAudio = 'output.mp3'; // Output audio file path
//         await convertVideoToAudio(inputVideo, outputAudio);
//         const transcribedText = await transcribeAudioToText(outputAudio);
//         const textFromFile = await readFile(textFilePath);
//         const similarity = await calculateSimilarity(transcribedText, textFromFile);
//         console.log(`Similarity between the video and text file: ${similarity}%`);
//     } catch (error) {
//         console.error('An error occurred:', error);
//     }
// };

// // Example usage
// const inputVideo = 'video.mp4'; // Input video file path
// const textFilePath = 'Untitled.txt'; // Path to the text file
// main(inputVideo, textFilePath);


const { spawn } = require('child_process');
const ffmpeg = require('fluent-ffmpeg');
const { AssemblyAI } = require('assemblyai');
const fs = require('fs');

// Function to call Python code and pass data to it
const callPythonScript = (text) => {
    return new Promise((resolve, reject) => {
        const pythonProcess = spawn('/Users/sujith/Documents/PycharmProjects/validation/.venv/bin/python3', ['/Users/sujith/Documents/PycharmProjects/validation/main.py']);

        // Send data to Python script
        pythonProcess.stdin.write(JSON.stringify(text));
        pythonProcess.stdin.end();

        let dataReceived = '';

        // Receive output from Python script
        pythonProcess.stdout.on('data', (data) => {
            dataReceived += data.toString();
        });

        // Handle error event
        pythonProcess.stderr.on('data', (data) => {
            console.error('Error from Python script:', data.toString());
            reject(data.toString());
        });

        // Handle exit event
        pythonProcess.on('close', (code) => {
            if (code !== 0) {
                console.error(`Python script exited with code ${code}`);
                reject(`Python script exited with code ${code}`);
            } else {
                // Resolve with the output string directly
                resolve(dataReceived.trim());
            }
        });
    });
};

// Function to convert video to audio
const convertVideoToAudio = (inputVideo, outputAudio) => {
    return new Promise((resolve, reject) => {
        ffmpeg(inputVideo)
            .noVideo() // no video output
            .audioCodec('libmp3lame') // library that converts to mp3
            .save(outputAudio)
            .on('end', () => {
                console.log('Conversion complete');
                resolve(outputAudio);
            })
            .on('error', (err) => {
                console.error('Error converting video to audio:', err);
                reject(err);
            });
    });
};

// Function to transcribe audio to text
const transcribeAudioToText = async (audioUrl) => {
    const client = new AssemblyAI({ apiKey: "4b1bb8144f1d4ba19a12430eb772cedd" });
    const config = { audio_url: audioUrl };

    try {
        const transcript = await client.transcripts.create(config);
        return transcript.text;
    } catch (error) {
        console.error('Error transcribing audio to text:', error);
        throw error;
    }
};

// Function to calculate similarity between two texts
const calculateSimilarity = async (text1, text2) => {
    const distance = levenshteinDistance(text1, text2);
    const maxLength = Math.max(text1.length, text2.length);
    const similarityPercentage = ((maxLength - distance) / maxLength) * 100;
    return similarityPercentage.toFixed(2);
};

// Function to read text from a file
const readFile = (filePath) => {
    return new Promise((resolve, reject) => {
        fs.readFile(filePath, 'utf8', (err, data) => {
            if (err) {
                reject(err);
            } else {
                resolve(data);
            }
        });
    });
};

// Function to calculate Levenshtein distance
const levenshteinDistance = (str1, str2) => {
    // Implementation of Levenshtein distance...
    const m = str1.length;
    const n = str2.length;
    const dp = Array.from(Array(m + 1), () => Array(n + 1).fill(0));

    for (let i = 0; i <= m; i++) {
        for (let j = 0; j <= n; j++) {
            if (i === 0) {
                dp[i][j] = j;
            } else if (j === 0) {
                dp[i][j] = i;
            } else if (str1[i - 1] === str2[j - 1]) {
                dp[i][j] = dp[i - 1][j - 1];
            } else {
                dp[i][j] = 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
            }
        }
    }

    return dp[m][n];
};

// Main function to integrate all functionalities
const main = async (inputVideo, textFilePath) => {
    try {
        const outputAudio = 'output.mp3'; // Output audio file path
        await convertVideoToAudio(inputVideo, outputAudio);
        const transcribedText = await transcribeAudioToText(outputAudio);
        const textFromFile = await readFile(textFilePath);
        
        // Check for bad words in the transcribed text
        const badWordsCheckTranscribed = await callPythonScript(transcribedText);

        // Check for bad words in the text from file
        const badWordsCheckFile = await callPythonScript(textFromFile);

        // If either of the texts has bad words, print corresponding message
        if (badWordsCheckTranscribed === "true" || badWordsCheckFile === "true") {
            console.log("Text contains bad words. Similarity cannot be calculated.");
        } else {
            // Calculate similarity if no bad words found
            const similarity = await calculateSimilarity(transcribedText, textFromFile);
            console.log(`Similarity between the video and text file: ${similarity}%`);
        }
    } catch (error) {
        console.error('An error occurred:', error);
    }
};

// Example usage
const inputVideo = 'video.mp4'; // Input video file path
const textFilePath = 'Untitled.pdf'; // Path to the text file
main(inputVideo, textFilePath);