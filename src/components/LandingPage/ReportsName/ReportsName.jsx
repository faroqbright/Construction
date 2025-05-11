import arrow from "../../../assets/arrow.svg";
import noti from "../../../assets/notif.svg";
import { Avatar } from "@mui/material";
const ReportsName = () => {
  return (
    <>
      <div className="container">
        <div className="grid grid-cols-1 md:grid-cols-12  font-raleway ">
          <div className="col-span-9">
            <div className="flex justify-between items-center w-full h-auto md:h-14 px-4 my-4">
              <div className="flex items-center w-auto">
                <div className="bg-white px-2 py-2 text-center rounded-full">
                  <img src={arrow} alt="Back" className="w-3 h-3" />
                </div>
                <span className="text-black font-semibold text-sm mx-3">
                  Report Name
                </span>
              </div>

              <div className="flex items-center space-x-6">
                <img
                  src={noti}
                  alt="Notification Icon"
                  className="cursor-pointer w-5 h-5"
                />
                <Avatar
                  alt="User"
                  src="https://i.pravatar.cc/40"
                  className="border border-gray-300"
                  sx={{ width: 36, height: 36 }}
                />
              </div>
            </div>
            <div className="min-h-screen  flex items-center justify-center p-4">
              <div className="bg-white border border-gray-300 shadow-md rounded-lg p-6 w-full max-w-4xl">
                <h1 className="text-lg font-semibold mb-4">Lorem Ipsum</h1>

                <div className="space-y-4 text-gray-700">
                  {Array.from({ length: 10 }).map((_, index) => (
                    <p key={index}>
                      Lorem ipsum dolor sit amet consectetur. Libero non morbi
                      pellentesque vestibulum. Scelerisque lectus nec integer
                      interdum. Risus massa eleifend a amet sem ac nulla
                      vulputate. Luctus aliquam lacus pulvinar dictum id sit
                      venenatis dictum. Risus suspendisse egestas velit non
                      fermentum feugiat ac. Tristique tellus et vulputate
                      ultricies faucibus eget potenti. In aliquet vulputate
                      viverra mattis neque. Nula dictum vitae eleifend.
                    </p>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ReportsName;
