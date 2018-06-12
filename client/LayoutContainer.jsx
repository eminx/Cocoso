import React from 'react';
import { Link } from 'react-router-dom';
import { Layout, Menu } from 'antd/lib';
import Blaze from 'meteor/gadicc:blaze-react-component';
const { Header, Content, Footer } = Layout;

class LayoutContainer extends React.Component {
  render() {
    const { match, children } = this.props;
    const pathname = match.location.pathname;

    return (
      <div>
        <Layout className="layout">
          <Header style={{backgroundColor: '#fff'}}>
            <Menu
              selectedKeys={[pathname]}
              mode="horizontal"
              style={{ lineHeight: '64px', float: 'right' }}
            >
              {/*<Menu.Item key="/bookings">
                <Link to="/">Bookings</Link>
              </Menu.Item>*/}
              <Menu.Item key="/create">
                <Link to="/book">Book</Link>
              </Menu.Item>
              <Menu.Item key="/login">
                <Blaze template="loginButtons" />
              </Menu.Item>
            </Menu>
            <Link to="/">
              <div className="logo skogen-logo" />
            </Link>
          </Header>
          <Content style={{ marginTop: 20 }}>
            {children}
          </Content>
          <Footer style={{ textAlign: 'center' }}>
            
          </Footer>
        </Layout>
      </div>
    )
  }
}

export default LayoutContainer;