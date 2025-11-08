import apiClient from "./apiClient";
export const fetchShoolYear = async () => {
  try {
    const response = await apiClient.get("/utility/school-year", {
      headers: { "Content-Type": "application/json" },
    });

    return response.data;
  } catch (err) {
    if (err instanceof Error) {
      return "No School Year Fetch";
    } else {
      return "Failed to fetch school year";
    }
  }
};

export const fetchSemester = async () => {
  try {
    const response = await apiClient.get("/utility/semester", {
      headers: { "Content-Type": "application/json" },
    });

    return response.data;
  } catch (err) {
    if (err instanceof Error) {
      return "No Semester Fetch";
    } else {
      return "Failed to Fetch Semester";
    }
  }
};

export const fetchTotalSlots = async () => {
  try {
  } catch (err) {
    console.log(err);
  }
};

  // async function getUserData(params:UserProps) {
  //   try {

  //     const { student_id, user_id } = params;
  //     const id = student_id || user_id;

  //     if (!id) {
  //       throw new Error("No student_id or user_id found in params");
  //     }

  //     const response = await apiClient.post(`/auth/get-user-data`, { id });
      
  //     return response.data.data[0];
  //   } catch (error) {
  //     console.log("Failed to fetch user data:", error);
  //     return null;
  //   }
  // }

  export const getUserData = async (props: {id: string}) => {
      try {

      const { id } = props;

      if (!id) {
        throw new Error("No id found in params");
      }

      const response = await apiClient.post(`/auth/get-user-data`, { id });
      
      return response.data.data[0];
    } catch (error) {
      console.log("Failed to fetch user data:", error);
      return null;
    }
    
  }

export const fetchPendingAppointments = async () => {
  try {
  } catch (err) {
    console.log(err);
  }
};
