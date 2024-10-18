"use client";

import { Select, SelectItem } from "@nextui-org/select";
import { Switch } from "@nextui-org/switch";
import { DatePicker, DateRangePicker } from "@nextui-org/date-picker";
import { Textarea, Input } from "@nextui-org/input";
import { Button } from "@nextui-org/react";
import { useState, useRef, useEffect, useCallback } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { getLocalTimeZone, today } from "@internationalized/date";
import clsx from "clsx";
import Link from "next/link";

import { ERROR_MESSAGE } from "./libs/enums/enums";
import { newDayOff, login } from "./actions";

const offTypes = [
  { type: "Leave Day" },
  { type: "Points Off Day" },
  { type: "Travel Day" },
  { type: "Travel and Points Off Day" },
];

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button
      className="border-[]"
      isDisabled={pending}
      radius="full"
      type="submit"
      variant="solid"
    >
      {pending ? "Submitting" : "Submit"}
    </Button>
  );
}

type InitialLeaveState = {
  message: string;
};

const initialLeaveState: InitialLeaveState = {
  message: "",
};

type InitialLoginState = {
  user_id: number | null;
  username: string;
  message: string;
};

const initialLoginState: InitialLoginState = {
  user_id: null,
  username: "",
  message: "",
};

type CurrentUserType = {
  id: number;
  username: string;
};

export default function Home() {
  const [isSingle, setIsSingle] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<CurrentUserType>();
  const [leaveState, leaveFormAction] = useFormState(
    newDayOff,
    initialLeaveState,
  );
  const [loginState, loginFormAction] = useFormState(login, initialLoginState);
  const [message, setMessage] = useState<string>("");
  const [isError, setIsError] = useState<boolean>(false);
  const [storageString, setStorageString] = useState<string | null>("");
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (leaveState.message) {
      const messageToCheck = leaveState.message;
      const isMessagePresent = Object.values(ERROR_MESSAGE).some(
        (errorMessage) => errorMessage === messageToCheck,
      );

      setIsError(isMessagePresent);
      if (leaveState.message === "Off day added successfully!") {
        formRef.current?.reset();
      }

      setMessage(leaveState.message);
    }
  }, [leaveState]);

  useEffect(() => {
    if (message === "Login") {
      setMessage("");
    }
  }, [message]);

  useEffect(() => {
    if (loginState.message) {
      const messageToCheck = loginState.message;
      const isMessagePresent = Object.values(ERROR_MESSAGE).some(
        (errorMessage) => errorMessage === messageToCheck,
      );

      setIsError(isMessagePresent);
      setMessage(loginState.message);
    }
  }, [loginState]);

  useEffect(() => {
    if (loginState.user_id) {
      setCurrentUser({ id: loginState.user_id, username: loginState.username });
      const storageString = {
        id: loginState.user_id,
        username: loginState.username,
      };

      localStorage.setItem("currentUser", JSON.stringify(storageString));
    }
  }, [loginState]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const currentUserStorage = localStorage.getItem("currentUser");

      setStorageString(currentUserStorage);
    }
  }, []);

  useEffect(() => {
    if (storageString) {
      const storedUser: CurrentUserType = JSON.parse(storageString);

      setCurrentUser({ id: storedUser.id, username: storedUser.username });
    }
  }, [storageString]);

  const handleSignout = useCallback(() => {
    setCurrentUser(undefined);
    setMessage("");
    localStorage.removeItem("currentUser");
  }, []);

  return (
    <section className="flex flex-col items-center justify-center gap-4 py-8 md:py-10">
      <div className="w-full">
        {currentUser ? (
          <form
            ref={formRef}
            action={leaveFormAction}
            className="flex justify-center flex-col gap-5 max-w-[320px] w-full mx-auto"
          >
            <h2 className="text-lg">
              G{"'"}day {currentUser.username}
            </h2>
            <Select
              isRequired
              className="max-w-xs"
              label="Day Off Type"
              name="offType"
              placeholder="Select a type"
            >
              {offTypes.map((types) => (
                <SelectItem key={types.type.toLocaleLowerCase()}>
                  {types.type}
                </SelectItem>
              ))}
            </Select>
            <div className="flex justify-between items-center flex-row">
              <span className="ml text-sm">Single Day</span>
              <Switch isSelected={isSingle} onValueChange={setIsSingle} />
            </div>
            {isSingle ? (
              <DatePicker
                isRequired
                label="Off Date"
                minValue={today(getLocalTimeZone())}
                name="offDate"
              />
            ) : (
              <DateRangePicker
                isRequired
                endName="endOff"
                label="Off Duration"
                minValue={today(getLocalTimeZone())}
                startName="startOff"
                visibleMonths={2}
              />
            )}
            <Textarea
              className="max-w-xs"
              label="Note"
              labelPlacement="outside"
              name="note"
              placeholder="Enter your description"
              variant="bordered"
            />
            <input name="user" type="hidden" value={currentUser.id} />
            <span
              className={clsx(
                message === ""
                  ? "hidden"
                  : "text-green-500 text-sm text-center",
                isError ? "text-center text-sm italic text-red-500" : "",
              )}
            >
              {message}
            </span>
            <SubmitButton />
            <Button radius="full" variant="bordered" onClick={handleSignout}>
              Sign Out
            </Button>
          </form>
        ) : (
          <form
            action={loginFormAction}
            className="flex justify-center flex-col gap-5 max-w-[320px] w-full mx-auto"
          >
            <h2>Login</h2>
            <Input
              isRequired
              label="Username"
              name="username"
              placeholder="Enter your clock in username"
            />
            <Input
              isRequired
              label="Password"
              name="password"
              placeholder="Enter your clock in pin"
              type="password"
            />
            <span
              className={clsx(
                isError ? "text-center text-sm italic text-red-500" : "hidden",
              )}
            >
              {message}
            </span>
            <SubmitButton />
            <Link
              className="text-center text-xs hover:underline"
              href={"https://time.zanda.info/"}
            >
              Time In / Time Out
            </Link>
          </form>
        )}
      </div>
    </section>
  );
}
