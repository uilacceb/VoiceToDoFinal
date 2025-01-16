# Voice-Enabled To-Do List App  
Effortlessly manage tasks using voice commands or manual input. Perfect for staying organized on the go!  

## Features  
- Add tasks via voice commands  
- Easy-to-use interface  

## Installation  
1. Clone the repository  
2. Install dependencies:
   - Navigate to the server folder and run ***"npm install"***
   - Navigate to the client folder and run ***"npm install"***
3. Set up environment variables:
   - Create a ***.env*** file in the root folder.
   - Add the following variables:
     - ***GOOGLE_API_KEY=your-google-speech-to-text-api-key***
     - ***MONGO_URI=your-mongo-uri***
4. Update the API URLs in the client
   - Go to client/service/taskService.js and set the API_URL to ***"http://{Your Local IP Address}:3000"***
   - Go to client/functions/transcribeSpeech.js and set the rootOrigin to ***"http://{Your Local IP Address}"***
5. Run the app:
   - go to the server folder and run ***"npm run dev"***
   - go to the client folder and run ***"npx expo start"***


## Contributors  
- Rebecca Liu 
- Mauro Zegarra 
- Gabriela Waisman
- Ming-Hsun Hsu
- Jordan Coque  

