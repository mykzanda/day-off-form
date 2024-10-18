import {
  createDirectus,
  staticToken,
  rest,
  createItem,
  readItems,
  readItem,
  verifyHash,
} from "@directus/sdk";

const apiClient = process.env.DIRECTUS_API_KEY
  ? createDirectus("https://data.zanda.info")
      .with(staticToken("YQRwVAFUn-LlC_IOPoOkpVLeH75QBlyI"))
      .with(rest({ credentials: "include" }))
  : undefined;

const offDays: any = "Employee_Days_Off";

type creationPayload = {
  user: number;
  single: boolean;
  startDate: string | null;
  endDate: string | null;
  notes: string | null;
  type: string;
};

export async function createOffDays(payload: creationPayload) {
  try {
    const data = await apiClient?.request(
      createItem(offDays, {
        Employee: payload.user,
        Single_Day: payload.single,
        Start_Day: payload.startDate,
        End_Date: payload.endDate,
        Notes: payload.notes,
        Day_Off_Type: payload.type,
      }),
    );

    return JSON.stringify(data);
  } catch (error) {
    return `${error}`;
  }
}

const employees: any = "Employees";

export async function getUser(user: string): Promise<string> {
  try {
    const data = await apiClient?.request(
      readItems(employees, {
        fields: ["id", "Employee_Username", "employee_pin", "First_Name"],
        filter: {
          Employee_Username: {
            _eq: user,
          },
        },
        limit: 1,
      }),
    );

    return JSON.stringify(data);
  } catch (error) {
    return `Server error: ${error}`;
  }
}

export async function readUser(user: number): Promise<string> {
  try {
    const data = await apiClient?.request(
      readItem(employees, user, {
        fields: ["id", "Employee_Username", "employee_pin", "First_Name"],
      }),
    );

    return JSON.stringify(data);
  } catch (error) {
    return JSON.stringify(error);
  }
}

export async function verifyPin(pin: string, hash: string) {
  return apiClient?.request(verifyHash(pin, hash));
}
