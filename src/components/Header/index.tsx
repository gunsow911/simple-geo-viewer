import React, { useContext, useEffect } from 'react';
import { context } from '@/pages';
import DisasterSelector  from "@/components/Header/DisasterSelector";

function Header() {
  const { preferences } = useContext(context);
  const { isDisaster } = useContext(context)
  const headerStyle = {
    backgroundColor: preferences.settings.background_color,
  };
  
  console.log(isDisaster);
  
  return (
    <header style={headerStyle} className="h-full flex justify-left items-center">
      <div className="text-left text-white text-xl w-7/12 p-3">
        {preferences.settings.title}
      </div>
      <div className="text-right text-white font-semibold text-3l w-7/12 p-3">Powerd By AIGID</div>
      { isDisaster ? (
        <div className="text-left z-10 absolute top-2 right-40 bg-white p-1">
          <DisasterSelector />
        </div>
      ) : null}
      
    </header>
  );
}

export default Header;
