import { Button } from "@mui/material";
import { format } from "date-fns";
import React, { useEffect, useState } from "react";
import { DayPicker } from "react-day-picker";
import "react-day-picker/style.css";
import Loading from "../components/Loading";
import Modal from "../components/Modal";
import { notifyError, notifyInfo, notifySuccess } from "../components/ToastUtils";
import { useUser } from "../services/UserContext";
import apiClient from "../services/apiClient";

type calendarProps = {
  transaction_title?: string;
  alreadySelectedDates?: string[];
  setIsOpenCalendar: React.Dispatch<React.SetStateAction<boolean>>;
};

type timewindowProps = {
  end_time_am: string;
  end_time_pm: string;
  start_time_am: string;
  start_time_pm: string;
  time_window_id: number;
  availability_date: string;
  capacity_per_day: number;
  total_slots_left: number;
  total_am_appointments: number;
  total_pm_appointments: number;
  college: string;
  availability_type: string;
};

type availableDatesProps = {
  availability_date: string;
  availability_id: number;
  capacity_per_day: number;
  created_at: string;
  created_by: number;
  end_date: string;
  start_date: string;
  semester: string;
  school_year: string;
  college: string;
  time_windows: timewindowProps[];
  transaction_title: string;
};

function Calendar({
  transaction_title,
  alreadySelectedDates = [],
  setIsOpenCalendar,
}: calendarProps) {
  const [selected, setSelected] = useState<Date | undefined>();
  const [formattedDate, setFormattedDate] = useState<string>("");
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [selectedTimeFrame, setSelectedTimeFrame] = useState<string>("");
  const [transactionTypeID, setTransactionTypeID] = useState<number>(0);
  const [parsedAvailableDates, setParsedAvailableDates] = useState<Date[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [selectedDateAvailability, setSelectedDateAvailability] =
    useState<timewindowProps>();

  const [availableDateInfo, setAvailableDateInfo] = useState<timewindowProps[]>(
    []
  );

  const { userdata, semester, schoolYear } = useUser();
  const handleClose = () => {
    setIsOpen(false);
  };

  const checkAvailabilityType = (selectedDate: Date | undefined) => {
    if (selectedDate) {
      const formated = format(selectedDate, "yyyy-MM-dd");

      const specificAvailability = availableDateInfo.filter(
        (date) => date.availability_date === formated
      );

      console.log(specificAvailability[0]);
      setSelectedDateAvailability(specificAvailability[0]);
    }
  };

  const handleDateSelection = (date: Date | undefined) => {
    if (date) {
      setSelected(date);
      checkAvailabilityType(date);
      setIsOpen(true);

      date
        ? setFormattedDate(format(date, "yyyy-MM-dd"))
        : setFormattedDate("");
    }
  };

  const parsedDates = async (mappedTime: timewindowProps[]) => {
    const availableDates: Date[] = mappedTime
      .map((date) => new Date(date.availability_date))
      .flat();

    setParsedAvailableDates(availableDates);
  };

  const handleFetchingAvailableDates = async () => {
    const str = userdata?.student_details?.college;
    const studentCollege = str?.split(" -")[0];
    const data = {
      model: "schedulesModel",
      function_name: "getAvailability",
      payload: {
        searchkey: transaction_title,
        college: studentCollege,
        semester: semester?.semester,
        school_year: schoolYear?.schoolYear,
      },
    };

    try {
      const response = await apiClient.post("/scheduling-system/user", data, {
        headers: { "Content-Type": "application/json" },
      });

      if(response.data.data.length === 0){
        notifyInfo("No Available Dates Yet!");
        return;
      }

      if (response.data.success) {
        setTransactionTypeID(response.data.data[0].transaction_type_id);
        if (response.data.data.length != 0) {
          const mappedTime: timewindowProps[] = response.data.data
            .map((item: availableDatesProps) =>
              item.transaction_title.toLowerCase() ===
              transaction_title?.toLowerCase()
                ? item.time_windows.map((window) => ({
                    ...window,
                    college: item.college,
                  }))
                : []
            )
            .flat();

          setAvailableDateInfo(mappedTime); // use for checking the fullybook dates
          parsedDates(mappedTime); //use to filter dates
        } else {
          notifyError("Can't Parse Dates");
        }
      } else {
        notifyError("Can't Fetch Available Dates");
      }
    } catch (error: any) {
      console.error("Component Error: ", error.message);
    }
  };

  const handleCreateAppointment = async () => {
    if (selectedTimeFrame === "") {
      notifyError("Please select Either AM or PM");
      return;
    }

    const data = {
      model: "schedulesModel",
      function_name: "insertAppointment",
      payload: {
        time_frame: selectedTimeFrame,
        transaction_type_id: transactionTypeID,
        user_id: userdata?.student_id,
        semester: semester?.semester,
        school_year: schoolYear?.schoolYear,
        appointment_date: formattedDate,
      },
    };

    setIsLoading(true);
    console.log(data);
    try {
      const response = await apiClient.post("/scheduling-system/user", data, {
        headers: { "Content-Type": "application/json" },
      });

      if (response.data.data[0].result.success) {
        notifySuccess("Appointment Set Successfully");
      } else {
        notifyError("Appointment Set Failed");
      }
    } catch (err: any) {
      console.error(err.message);
    } finally {
      setIsOpenCalendar(false);
      setIsOpen(false);
      setIsLoading(false);
    }
  };

  const handleSelectedTimeFrame = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedTimeFrame(e.target.value);
  };
  useEffect(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    setCurrentDate(today);
    handleFetchingAvailableDates();
  }, []);

  return (
    <>
      {isLoading && <Loading />}
      {isOpen ? (
        <Modal isOpen={isOpen} handleClose={handleClose}>
          <h3>{formattedDate}</h3>
          <div className="flex flex-col gap-2 mb-4 w-full">
            <label
              htmlFor="am-pm-select"
              className="text-sm font-medium text-gray-700"
            >
              Select Time
            </label>
            <select
              value={selectedTimeFrame}
              onChange={handleSelectedTimeFrame}
              id="am-pm-select"
              className="px-6 py-3 rounded-lg border h-10 border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 text-gray-800 text-base font-semibold w-full"
              required
            >
              <option value="">--Select an option--</option>
              <option
                value="AM"
                disabled={
                  selectedDateAvailability
                    ? selectedDateAvailability?.capacity_per_day / 2 ===
                      selectedDateAvailability?.total_am_appointments
                      ? true
                      : selectedDateAvailability?.availability_type === "full"
                        ? false
                        : selectedDateAvailability?.availability_type ===
                            "half_am"
                          ? false
                          : true
                    : true
                }
              >
                AM
              </option>
              <option
                value="PM"
                disabled={
                  selectedDateAvailability
                    ? selectedDateAvailability?.capacity_per_day / 2 ===
                      selectedDateAvailability?.total_pm_appointments
                      ? true
                      : selectedDateAvailability?.availability_type === "full"
                        ? false
                        : selectedDateAvailability?.availability_type ===
                            "half_pm"
                          ? false
                          : true
                    : true
                }
              >
                PM
              </option>
            </select>
          </div>
          <Button variant="contained" onClick={handleCreateAppointment}>
            CREATE APPOINTMENT
          </Button>
        </Modal>
      ) : (
        <></>
      )}

      <div className="w-full flex flex-col items-center">
        <h1 className="text-lg md:text-xl font-semibold mb-2 text-center">Select a Date</h1>
        <p className="text-sm md:text-base mb-3 text-center">Transaction: {transaction_title}</p>
        <div className="w-full max-w-full overflow-x-auto flex justify-center">
          <DayPicker
            animate
            className="bg-white rounded-lg shadow-md scale-90 md:scale-100"
            style={{ padding: "10px" }}
            mode="single"
            selected={selected}
            defaultMonth={new Date()}
            onSelect={handleDateSelection}
            modifiers={{ available: parsedAvailableDates }}
            modifiersClassNames={{
              available: "text-black",
            }}
            disabled={(date) =>
              date < currentDate ||
              availableDateInfo.some(
                (d) =>
                  d.total_slots_left === 0 &&
                  new Date(d.availability_date).toDateString() ===
                    date.toDateString()
              ) ||
              (!availableDateInfo.some(
                (info) =>
                  info.college === null &&
                  new Date(info.availability_date).toDateString() ===
                    date.toDateString()
              ) &&
                !availableDateInfo.some(
                  (info) =>
                    info.college ===
                      userdata?.student_details?.college.split(" -")[0] &&
                    new Date(info.availability_date).toDateString() ===
                      date.toDateString()
                )) ||
              !parsedAvailableDates.some(
                (d) => d.toDateString() === date.toDateString()
              ) ||
              alreadySelectedDates.some(
                (d) => new Date(d).toDateString() === date.toDateString()
              )
            }
            footer={
              selected
                ? `Selected: ${selected.toLocaleDateString()}`
                : "Pick a day."
            }
          />
        </div>
      </div>
    </>
  );
}

export default Calendar;
