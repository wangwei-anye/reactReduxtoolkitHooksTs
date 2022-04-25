import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Form, Input, Button, Checkbox, message } from 'antd';
import { login, register } from '@/services/login';
import './index.less';

const Login = () => {
  const [type, setType] = useState('login');
  const onFinish = async (values) => {
    const { data } = await login({
      username: values.username,
      password: values.password
    });

    if (data.code === 200) {
      localStorage.token = data.data;
      localStorage.userInfo = JSON.stringify({
        name: values.username
      });
      window.location.href = '/case-lib';
    }
  };
  const onFinishFailed = (errorInfo) => {
    console.log('Failed:', errorInfo);
  };

  const onFinishRegister = async (values) => {
    if (values.password !== values.passwordTwo) {
      message.info('两次输入的密码不一致');
      return;
    }
    const { data } = await register({
      username: values.username,
      password: values.password
    });

    if (data.code === 200) {
      message.success('注册成功');
      changeTypeHandle();
    }
  };
  const onFinishFailedRegister = (errorInfo) => {
    console.log('Failed:', errorInfo);
  };

  const changeTypeHandle = () => {
    setType(type === 'login' ? 'register' : 'login');
  };

  return (
    <div className='login-wrap'>
      {type === 'login' ? (
        <React.Fragment>
          <div className='title'>欢迎使用</div>
          <Form
            name='basic'
            labelCol={{
              span: 8
            }}
            wrapperCol={{
              span: 16
            }}
            initialValues={{
              username: '',
              password: ''
            }}
            onFinish={onFinish}
            onFinishFailed={onFinishFailed}
            autoComplete='off'
          >
            <Form.Item
              label='用户名'
              name='username'
              rules={[
                {
                  required: true,
                  message: 'Please input your username!'
                }
              ]}
            >
              <Input />
            </Form.Item>

            <Form.Item
              label='密码'
              name='password'
              rules={[
                {
                  required: true,
                  message: 'Please input your password!'
                }
              ]}
            >
              <Input.Password />
            </Form.Item>

            <Form.Item
              wrapperCol={{
                offset: 8,
                span: 16
              }}
            >
              <Button type='primary' htmlType='submit'>
                登入
              </Button>
              <span
                style={{ marginLeft: '20px', color: '#1890ff', cursor: 'pointer' }}
                onClick={changeTypeHandle}
              >
                注册
              </span>
            </Form.Item>
          </Form>
        </React.Fragment>
      ) : (
        <React.Fragment>
          <div className='title'>用户注册</div>
          <Form
            name='basic'
            labelCol={{
              span: 8
            }}
            wrapperCol={{
              span: 16
            }}
            initialValues={{
              username: '',
              password: '',
              passwordTwo: ''
            }}
            onFinish={onFinishRegister}
            onFinishFailed={onFinishFailedRegister}
            autoComplete='off'
          >
            <Form.Item
              label='用户名'
              name='username'
              rules={[
                {
                  required: true,
                  message: 'Please input your username!'
                }
              ]}
            >
              <Input />
            </Form.Item>

            <Form.Item
              label='密码'
              name='password'
              rules={[
                {
                  required: true,
                  message: 'Please input your password!'
                }
              ]}
            >
              <Input.Password />
            </Form.Item>
            <Form.Item
              label='确认密码'
              name='passwordTwo'
              rules={[
                {
                  required: true,
                  message: 'Please input your password!'
                }
              ]}
            >
              <Input.Password />
            </Form.Item>
            <Form.Item
              wrapperCol={{
                offset: 8,
                span: 16
              }}
            >
              <Button type='primary' htmlType='submit'>
                注册
              </Button>
              <span
                style={{ marginLeft: '20px', color: '#1890ff', cursor: 'pointer' }}
                onClick={changeTypeHandle}
              >
                登入
              </span>
            </Form.Item>
          </Form>
        </React.Fragment>
      )}
    </div>
  );
};

export default Login;
