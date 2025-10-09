// this is secondary Layout for admin pages

import React, { ReactNode } from 'react';
import { getAuthSession } from '../../../lib/auth-utils/getAuthSession';
import { redirect } from 'next/navigation';
import { NavbarDesktopAdmin } from '@/components/navbar/NavbarDesktopAdmin';
import { NavbarMobileAdmin } from '@/components/navbar/NavbarMobileAdmin';

interface AdminLayoutProps {
  children: ReactNode;
}

export default async function AdminLayout({ children }: AdminLayoutProps) {

  const session = await getAuthSession();

  if (session.user.role !== "ADMIN") {
    return redirect("/auth/sign-in");
  }

  return (

          <div className={`antialiased min-h-screen max-w[100vw] flex`}>

            <div className="hidden md:block">
              <NavbarDesktopAdmin user={session.user}/>
            </div>

            <div className="md:hidden">
              <NavbarMobileAdmin user={session.user}/>
            </div>

            <main className='w-full md:ml-[calc(16rem+0.25rem)] border-l-2 border-l-gray-200 mt-[8vh] md:mt-0 bg-[var(--primary-background-main)] shadow-lg p-5'>{children}</main>

          </div>
                
  );
}