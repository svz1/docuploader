import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
};

function Layout({ children }: Props) {

  return (
    <div>

      <div className="topbar">
        <div className="logo">Student Onboarding</div>
      </div>

      <div className="page">
        {children}
      </div>

    </div>
  );
}

export default Layout;