// first way to interact with open AI MODEL

// import OpenAI from 'openai';
// import dotenv from 'dotenv';
// dotenv.config();

// const client = new OpenAI({
//   apiKey: process.env['OPEN_AI_API_KEY'], // This is the default and can be omitted
// });

// const response = await client.responses.create({
//   model: 'gpt-4o-mini',
//   input: 'diffrences between SQL and NOSQL',
// });

// console.log(response.output_text);


//second way to interact with open AI model

import "dotenv/config";

const getOpenAiAPIResponse=async(message)=>{
    const options={
        method:"POST",
        headers:{
            "Content-Type": "application/json",
            "Authorization":`Bearer ${process.env.OPEN_AI_API_KEY}`
        },
        body:JSON.stringify({
            model:"gpt-4o-mini",
            messages:[
                {
                    role: "user",
                    content: message
                  }
            ]
        })
    }
     try{
      let response= await fetch("https://api.openai.com/v1/chat/completions",options);
      const data=await response.json();
      return (data.choices[0].message.content);
     }catch(err){
      console.log(err);
      return "I'm sorry, I couldn't get a response from OpenAI.";
     }
}

export default getOpenAiAPIResponse;