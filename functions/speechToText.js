const speechToText = async (req, res) => {
  const data = req.body;
  const audioUrl = data?.audioUrl;
  const audioConfig = data?.config;

  if (!audioUrl) return res.status(422).send("no Audio URL was provided");
  if (!audioConfig) return res.status(422).send("no Audio Config was provided");

  // console.log("Audio Config:", audioConfig);
  // console.log("Audio Content (truncated):", audioUrl.slice(0, 100));

  try {
    const speechResults = await fetch(
      "https://speech.googleapis.com/v1/speech:recognize",
      {
        method: "POST",
        body: JSON.stringify({
          audio: {
            content: audioUrl,
          },
          config: audioConfig,
        }),
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          "X-goog-api-key": `${process.env.GOOGLE_SPEECH_TO_TEXT_API_KEY}`,
        },
      }
    ).then((response) => response.json());
    console.log({ results: speechResults.results?.[0].alternatives?.[0] });
    // ------------
    // console.log("Google API Response:", speechResults);
    //   if (!speechResults?.results || speechResults.results.length === 0) {
    //   console.error("No results returned from Google Speech-to-Text API.");
    //   console.log(process.env.GOOGLE_SPEECH_TO_TEXT_API_KEY);
    //   // return res.status(404).send("No transcription results received");
    // }
    // ------------
    return res.send(speechResults);
  } catch (err) {
    console.error("Error converting speech to text: ", err);
    res.status(404).send(err);
    return err;
  }
};

module.exports = speechToText