import React, { useContext } from 'react';
import { context } from '@/pages';
import DisasterSelector  from "@/components/Header/DisasterSelector";
import { useRouter } from 'next/router';

function Header() {
  const { preferences } = useContext(context);
  const headerStyle = {
    backgroundColor: preferences.settings.background_color,
  };
  const router = useRouter();
  const isDisaster = router.query.isDisaster as boolean | undefined;

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
