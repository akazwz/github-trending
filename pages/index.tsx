import {
	Avatar,
	Box,
	Heading,
	HStack,
	Link,
	VStack,
	Text,
	Spacer,
	Center,
	Circle,
	Spinner,
	Button,
	Stack,
	Menu,
	MenuButton,
	MenuList,
	MenuItem,
	Input,
	IconButton,
	useDisclosure,
	useColorMode,
} from '@chakra-ui/react'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import dayjs from 'dayjs'
import { GoRepoForked, GoStar } from 'react-icons/go'
import { BsMoonFill, BsSunFill } from 'react-icons/bs'

const colors = require('../src/colors.json')

const SinceFilter = () => {
	const router = useRouter()
	const { since } = router.query

	const handleClick = async(since: string) => {
		await router.replace({
			pathname: '/',
			query: {
				...router.query,
				since,
			}
		})
	}

	return (
		<Menu>
			<MenuButton as={Button}>
				{since ? since[0].toUpperCase() + since.slice(1) : 'Since'}
			</MenuButton>
			<MenuList>
				<MenuItem onClick={() => handleClick('daily')}>Daily</MenuItem>
				<MenuItem onClick={() => handleClick('weekly')}>Weekly</MenuItem>
				<MenuItem onClick={() => handleClick('monthly')}>Monthly</MenuItem>
				<MenuItem onClick={() => handleClick('yearly')}>Yearly</MenuItem>
			</MenuList>
		</Menu>
	)
}

const LanguageFilter = () => {
	const [value, setValue] = useState('')
	const { onClose, isOpen, onToggle } = useDisclosure()

	const router = useRouter()
	const { language } = router.query

	const handleClick = async(language: string) => {
		await router.push({
			pathname: '/',
			query: {
				...router.query,
				language,
			}
		})
	}

	return (
		<Menu isOpen={isOpen}>
			<MenuButton as={Button} onClick={onToggle}>
				{language ? language.toString().split('-',).map((item) => item[0].toUpperCase() + item.slice(1) + ' ') : 'Language'}
			</MenuButton>
			<MenuList maxHeight="200px" overflowY="scroll">
				<Input value={value} onInput={(event) => {setValue(event.currentTarget.value)}} />
				<HStack
					key={'all-language'}
					p={3}
					borderBottomWidth={1}
					cursor="pointer"
					onClick={async() => {
						await handleClick('')
						onClose()
					}}
				>
					<Text>All</Text>
				</HStack>
				{
					Object.keys(colors).filter((lang) => {
						return lang.toLowerCase().indexOf(value.toLowerCase()) >= 0
					}).map((item) => {
						return (
							<HStack
								key={item}
								p={3}
								borderBottomWidth={1}
								cursor="pointer"
								onClick={async() => {
									await handleClick(item.replace(' ', '-').toLowerCase())
									onClose()
								}}
							>
								<Circle bgColor={colors[item]} size="10px" />
								<Text>{item}</Text>
							</HStack>
						)
					})
				}
			</MenuList>
		</Menu>
	)
}

const Options = () => {
	return (
		<HStack>
			<Box>
				<LanguageFilter />
			</Box>
			<Box>
				<SinceFilter />
			</Box>
		</HStack>
	)
}

const Home = () => {
	const [loading, setLoading] = useState(true)
	const [data, setData] = useState<any>({})
	const { items } = data

	const { toggleColorMode, colorMode } = useColorMode()

	const router = useRouter()
	const { language, since } = router.query

	let start: string
	const end = dayjs().format()
	switch (since) {
		case 'daily':
			start = dayjs().add(-1, 'day').format()
			break
		case 'weekly':
			start = dayjs().add(-1, 'week').format()
			break
		case 'monthly':
			start = dayjs().add(-1, 'month').format()
			break
		case 'yearly':
			start = dayjs().add(-1, 'year').format()
			break
		default:
			start = dayjs().add(-1, 'day').format()
	}

	useEffect(() => {
		if (!router.isReady) return
		setLoading(true)
		const getData = async() => {
			const BASE_API = `https://api.github.com/search/repositories`
			const sort = 'starts'
			const order = 'desc'
			const url = `${BASE_API}?q=language:${language}+created:${encodeURIComponent(start)}..${encodeURIComponent(end)}&sort=${sort}&order=${order}`
			const res = await fetch(url)
			const data = await res.json()
			setData(data)
		}
		getData().then().finally(() => setLoading(false))
	}, [router])

	return (
		<Box mx="auto" maxWidth="3xl" p={3}>
			<HStack>
				<Spacer />
				<IconButton
					aria-label={'toggle color mode'}
					icon={colorMode === 'dark' ? <BsSunFill /> : <BsMoonFill />}
					onClick={toggleColorMode}
				/>
			</HStack>
			<Center p={3}>
				<Heading>GitHub Trending</Heading>
			</Center>
			<Stack
				p={3}
				justifyContent="center"
				alignItems="center"
				flexDirection={{
					base: 'column',
					md: 'row',
				}}
			>
				<Text
					fontSize="lg"
					fontWeight="bold"
				>
					{`${dayjs(start).format('YYYY/MM/DD')} - ${dayjs(end).format('YYYY/MM/DD')}`}
				</Text>
				<Spacer />
				<Options />
			</Stack>
			{
				loading
					? <Center h="70vh"><Spinner size="lg" /></Center>
					: (
						items && items.length > 0 && items.map((item: any) => {
							return (
								<HStack key={item.id} p={5} m={3} borderWidth={1} rounded="lg">
									<VStack alignItems="flex-start">
										<Link href={item.html_url} color="blue.500" fontSize="lg" fontWeight="bold">
											<Text>
												{item.owner.login} / {item.name}
											</Text>
										</Link>
										<Text>
											{item.description}
										</Text>
										<HStack justifyContent="center" alignItems="center" fontSize="sm">
											{
												item.language && (
													<>
														<Circle bgColor={colors[item.language]} size="10px" />
														<Text>{item.language}</Text>
													</>
												)
											}
											<HStack spacing={1}><GoStar /> <Text>{item.stargazers_count}</Text></HStack>
											<HStack spacing={1}><GoRepoForked /> <Text>{item.forks_count}</Text></HStack>
										</HStack>
									</VStack>
									<Spacer />
									<Link href={item.owner.html_url}>
										<Avatar src={item.owner.avatar_url} size="lg" />
									</Link>
								</HStack>
							)
						})
					)
			}
		</Box>
	)
}

export default Home
