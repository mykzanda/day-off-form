"use server";
import { z } from "zod";

import { ERROR_MESSAGE } from "./libs/enums/enums";

import { createOffDays, getUser, verifyPin, readUser } from "@/libs/directus";

type ParsedDataType = {
  offType: string;
  offDate: string | null;
  endOff: string | null;
  startOff: string | null;
  note: string | null;
  user: string;
};

type creationPayload = {
  user: number;
  single: boolean;
  startDate: string | null;
  endDate: string | null;
  notes: string | null;
  type: string;
};

type UserDto = {
  id: number;
  Employee_Username: string;
  employee_pin: string;
  First_Name: string;
};

export async function login(
  prevState: {
    message: string;
  },
  formData: FormData,
) {
  const schema = z.object({
    name: z.string(),
    password: z.string(),
  });

  const parse = schema.safeParse({
    name: formData.get("username"),
    password: formData.get("password"),
  });

  if (!parse.success) {
    return { message: ERROR_MESSAGE.PARSE_ERROR, user_id: null, username: "" };
  }

  const data = parse.data;

  try {
    const user = await getUser(data.name);
    const userData: UserDto[] = JSON.parse(user);

    if (userData.length === 0) {
      return { message: ERROR_MESSAGE.NO_USER, user_id: null, username: "" };
    }

    const isPasswordValid = await verifyPin(
      data.password,
      userData[0].employee_pin,
    );

    if (!isPasswordValid) {
      return {
        message: ERROR_MESSAGE.BAD_PASSWORD,
        user_id: null,
        username: "",
      };
    }

    return {
      message: "Login",
      user_id: userData[0].id,
      username: userData[0].First_Name,
    };
  } catch (error) {
    return { message: ERROR_MESSAGE.SERVER_ERROR, user_id: null, username: "" };
  }
}

export async function newDayOff(
  prevState: {
    message: string;
  },
  formData: FormData,
) {
  const schema = z.object({
    offType: z.string(),
    offDate: z.string().nullable(),
    endOff: z.string().nullable(),
    startOff: z.string().nullable(),
    note: z.string().nullable(),
    user: z.string(),
  });

  const parse = schema.safeParse({
    offType: formData.get("offType"),
    offDate: formData.get("offDate"),
    endOff: formData.get("endOff"),
    startOff: formData.get("startOff"),
    note: formData.get("note"),
    user: formData.get("user"),
  });

  if (!parse.success) {
    return { message: ERROR_MESSAGE.PARSE_ERROR };
  }

  const data: ParsedDataType = parse.data;
  let isSingle = false;

  if (!data.offDate) {
    isSingle = true;
  }

  const actionPayload: creationPayload = {
    user: Number(data.user),
    single: isSingle,
    startDate: isSingle ? data.startOff : data.offDate,
    endDate: data.endOff ?? null,
    notes: data.note,
    type: data.offType,
  };

  try {
    const currentUser = await readUser(Number(data.user));
    const readUserData = JSON.parse(currentUser);

    if (readUserData.errors) {
      return { message: ERROR_MESSAGE.NO_USER };
    }

    await createOffDays(actionPayload);

    return { message: "Off day added successfully!" };
  } catch (error) {
    return { message: ERROR_MESSAGE.SERVER_ERROR };
  }
}
