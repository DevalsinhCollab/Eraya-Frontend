import Header from './Header/Header';
import Sidebar from './Sidebar/Sidebar';
import LayoutStyle from './Layout.module.scss';
import { getToken } from './common/common';
import { Navigate } from 'react-router';
import React, { useState } from 'react';

export default function Layout(props) {
  const { component } = props;
  const [search, setSearch] = useState('');

  if (getToken().error) {
    return <Navigate to={'/login'} />;
  }

  const enhancedComponent = React.cloneElement(component, { search });

  return (
    <div className={LayoutStyle.mainBox}>
      <Sidebar />
      <div className={LayoutStyle.subMainBox}>
        <Header  setSearch={setSearch} />
        <div className={LayoutStyle.contentBox}>{enhancedComponent}</div>
      </div>
    </div>
  );
}
