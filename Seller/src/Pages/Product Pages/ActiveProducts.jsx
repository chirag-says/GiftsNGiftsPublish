import React from "react";
import ProductStatusBoard from "../../Components/Products/ProductStatusBoard.jsx";
import { MdCheckCircle } from "react-icons/md";

function ActiveProducts() {
  return (
    <>
      {/* PAGE CONTAINER */}
      <div className="max-w-[1600px] mx-auto space-y-6">

        

        {/* PRODUCT STATUS MODULE */}
        <div
          className="
            rounded-2xl
            bg-white
            border border-gray-200
            shadow-[0_8px_30px_rgba(0,0,0,0.06)]
            p-4 sm:p-6 lg:p-8
          "
        >
          <ProductStatusBoard
            statusKey="active"
            title="Active Products"
            subtitle="Products currently published and available for sale."
            emptyMessage="No active listings right now."
          />
        </div>

      </div>
    </>
  );
}

export default ActiveProducts;
