# Voice-Enabled To-Do List App  
Effortlessly manage tasks using voice commands or manual input. Perfect for staying organized on the go!  

## Key Features  
- Add/Delete/Check/Uncheck tasks via voice commands
- Duplicates check
- Add one or more product in the same command.
- Works in IOS and Android (not web)
- Easy-to-use interface  

## Installation  
1. Clone the repository  
2. Install dependencies:
   - Navigate to the server folder and run ***"npm install"***
   - Navigate to the client folder and run ***"npm install"***
3. Set up environment variables:
   - Create a ***.env*** file in the root folder.
   - Add the following variables:
     - ***GOOGLE_API_KEY=your-google-speech-to-text-api-key*** (You can get an Google Api key at https://cloud.google.com/speech-to-text#turn-speech-into-text-using-google-ai)
     - ***MONGO_URI=your-mongo-uri***
4. Update the API URLs in the client
   - Go to client/service/taskService.js and set the API_URL to ***"http://{Your Local IP Address}:3000"***
   - Go to client/functions/transcribeSpeech.js and set the rootOrigin to ***"http://{Your Local IP Address}"***
5. Run the app:
   - go to the server folder and run ***"npm run dev"***
   - go to the client folder and run ***"npx expo start"***
  

## Demo
https://drive.google.com/file/d/1M2EWYSqiZJYV3xog30P0I3CLrIEBKAPS/view?usp=sharing


## Contributors  
- Rebecca Liu 
- Mauro Zegarra 
- Gabriela Waisman
- Ming-Hsun Hsu
- Jordan Coque  

