import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Select, Space, Upload, message, Row, Col, Card, Spin, List, Avatar, Result } from 'antd';
import { addChartUsingPost, genChartByAiUsingPost, listChartByPageUsingPost, listMyChartByPageUsingPost } from '@/services/yupi/chartController';
import ReactECharts from 'echarts-for-react';
import { useModel } from '@umijs/max';
import { stringify } from 'querystring';



/** 
 * 我的图表页面
 * @returns 
 */
const { Search } = Input;
const MyChartPage: React.FC = () => {
    const { initialState } = useModel("@@initialState") // 获取全局状态 (登录的用户数据)
    const { currentUser } = initialState ?? {}   // 登录的用户信息
    const [loading, setLoading] = useState<boolean>(true) // 是否加载中
    const initSearchParams = {
        current: 1,
        pageSize: 4
    }
    const [total, setTotal] = useState<number>(0)


    const [searchParams, setSearchParams] = useState<API.ChartQueryRequest>({
        ...initSearchParams
    })
    const [chartList, setChartList] = useState<API.Chart[]>()
    const loadData = async () => {
        setLoading(true)
        try {
            const res = await listMyChartByPageUsingPost(searchParams);
            if (res.data) {
                // console.log("Data received:", res.data.records); // 调试输出
                setChartList(res.data.records ?? []); // 这里存放的依然是字符串格式
                // console.log("Chart list updated:", chartList); // 调试输出
                setTotal(res.data.total ?? 0);
                // 因为我们指定了 title 所以要清除自带的title(在json中)
                if(res.data.records){
                    res.data.records.forEach(data=>{
                        const option = JSON.parse(data.genChart ?? '{}') // 转json
                        option.title = undefined
                        data.genChart = JSON.stringify(option)
                    })
                }
            } else {
                message.error("获取我的图表失败")
            }
        } catch (e: any) {
            message.error("获取我的图表失败" + e.message)
        }
        setLoading(false)

    }
    // 首次渲染or触发条件时调用该函数
    useEffect(() => {
        loadData();// 执行loadData函数 查找我的图表
        console.log("Chart list updated:", chartList);
    }, [searchParams])
    return (
        <div className='My_chart_Page'>
            <div>
            <Search placeholder="输入图表名查询图表" loading={loading} enterButton onSearch={(value)=>{
                // 根据图表名称搜索
                setSearchParams({
                    ...initSearchParams,
                    name:value
                })

            }}/>
            <div className='margin-16'/>
            </div>

            <List
                itemLayout="vertical"
                size="large"
                pagination={{
                    onChange: (page,pageSize) => {
                        setSearchParams({
                            ...searchParams,
                            current: page,
                            pageSize,
                        })

                        
                    },
                    pageSize: 3,
                    current: searchParams.current,
                    total: total
                }}
                loading={loading}
                dataSource={chartList} // 图表数据源
                
                renderItem={(item) => (
                    <List.Item
                        key={item.id}
                    >
                        <List.Item.Meta
                            avatar={<Avatar src={currentUser?.userAvatar} />}
                            title={item.name}
                            description={item.chartType ? ('图表类型' + item.chartType) : undefined}
                        />
                        <>
                        {
                                item.status === 'wait' && <>
                                <Result
                                    status="warning"
                                    title="图表等待生成中"
                                    subTitle= {item.execMessage ?? '服务器繁忙,请耐心等候'}
                                />
                                </>

                            } 
                             {
                                item.status === 'running' && <>
                                <Result
                                    status="info"
                                    title="图表生成中"
                                    subTitle= {item.execMessage}
                                />
                                </>

                            }
                            {
                            item.status === 'succeed' && <> 
                            {'分析目标' + item.goal}
                            <div style={{ marginBottom: 16 }}>
                                <Card>
                                    {/* <ReactECharts option={item.genChart && JSON.parse(item.genChart ?? '{}')} /> */}
                                    <ReactECharts option={item.genChart && JSON.parse(item.genChart)}/>
                                </Card>
                            </div></>
                            }
                            {
                                item.status === 'failed' && <>
                                <Result
                                    status="error"
                                    title="图表生成失败"
                                    subTitle= {item.execMessage}
                                />
                                </>

                            }
                        </>
                       
                    </List.Item>
                )}
            />
        </div>
    );
};

export default MyChartPage;