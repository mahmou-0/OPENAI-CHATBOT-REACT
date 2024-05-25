import { NextFunction, Request, Response } from "express";
import User from "../models/User.js";
import { configureOpenAI } from "../config/openai-config.js";
import { OpenAIApi, ChatCompletionRequestMessage } from "openai";

export const generateChatCompletion = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { message } = req.body;

  try {
    console.log("Request Body:", req.body);

    const user = await User.findById(res.locals.jwtData.id);
    console.log("User:", user);

    if (!user) {
      console.error("User not found");
      return res
        .status(401)
        .json({ message: "User Not registered OR Token malfunction" });
    }

    // grab chats of the user
    const chats = user.chats.map(({ role, content }) => ({
      role,
      content,
    })) as ChatCompletionRequestMessage[];
    console.log("User Chats:", chats);

    chats.push({ content: message, role: "user" });
    console.log("Updated Chats with New Message:", chats);

    user.chats.push({ content: message, role: "user" });

    // send all chats with new one to openAI API
    const config = configureOpenAI();
    console.log("OpenAI Config:", config);

    const openai = new OpenAIApi(config);

    // get latest response

    const chatResponse = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: chats,
    });
    console.log("Chat Response:", chatResponse);

    user.chats.push(chatResponse.data.choices[0].message);
    console.log("Updated User Chats after OpenAI Response:", user.chats);

    await user.save();
    console.log("User Saved:", user);

    return res.status(200).json({ chats: user.chats });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({ message: "Something went Wrong" });
  }
};

export const sendChatsToUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    //user token check
    const user = await User.findById(res.locals.jwtData.id);
    if (!user) {
      return res.status(401).send("User not registered OR Token malfunctioned");
    }
    if (user._id.toString() !== res.locals.jwtData.id) {
      return res.status(401).send("Permissions didn't match");
    }
    return res.status(200).json({ message: "OK", chats: user.chats });
  } catch (error) {
    console.log(error);
    return res.status(200).json({ message: "ERROR", cause: error.message });
  }
};

export const deleteChats = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    //user token check
    const user = await User.findById(res.locals.jwtData.id);
    if (!user) {
      return res.status(401).send("User not registered OR Token malfunctioned");
    }
    if (user._id.toString() !== res.locals.jwtData.id) {
      return res.status(401).send("Permissions didn't match");
    }
    //@ts-ignore
    user.chats = [];
    await user.save();
    return res.status(200).json({ message: "OK" });
  } catch (error) {
    console.log(error);
    return res.status(200).json({ message: "ERROR", cause: error.message });
  }
};
