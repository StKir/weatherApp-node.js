import axios from 'axios';
import { AxiosResponse } from 'axios';
import fs from 'fs';
const commander = require('commander');

const filePath = `./config.json`;

interface Config {
	token: string;
	location: string;
}

function getCurrentWeather(token: string, location: string) {
	axios({
		method: 'get',
		url: 'http://api.weatherstack.com/current',
		params: {
			query: location,
			access_key: token
		}
	}).then((data: AxiosResponse<any>) => {
		if (!data.data.error) {
			console.log(`Сейчас в ${location}`);
			console.log(data.data.current.observation_time);
			console.log(data.data.current.temperature, 'Градуса по цельсию');
			console.log('скорость ветра - ', data.data.current.wind_speed, 'м/с');
		} else {
			console.log(data.data.error.info);
		}
	});
}

function createJsonFile(token: string, location: string): void {
	const jsonString = JSON.stringify(
		{
			token,
			location
		},
		null,
		2
	);
	try {
		fs.writeFileSync('config.json', jsonString);
		console.log('Файл настроек успешно создан.');
	} catch (error) {
		console.error('Ошибка создания настроек.', error);
	}
}

function readConfigFile(): Config | null {
	try {
		const data = fs.readFileSync(filePath, 'utf-8');
		const config: Config = JSON.parse(data);
		return config;
	} catch (error) {
		console.error('Ошибка чтения файла config.json:', error);
		return null;
	}
}

commander
	.command('weather')
	.alias('w')
	.description('Create new configuration file.')
	.action(() => {
		const config = readConfigFile();
		if (config) {
			getCurrentWeather(config.token, config.location);
		} else {
			throw new Error(
				'Конфигурационный файл отсутствует, запустите программу npx ts-node task.ts start "ваш токен" "Ваша локация"'
			);
		}
	});

commander
	.command('start <token> <location>')
	.alias('s <token> <location>')
	.description('Create new configuration file.')
	.action((token: string, location: string) => {
		createJsonFile(token, location);
	});

commander.parse(process.argv);
