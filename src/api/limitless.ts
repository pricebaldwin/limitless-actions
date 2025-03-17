import axios, { AxiosError, AxiosResponse } from 'axios';
import { getDbAdapter } from '../db/adapter';
import logger from '../utils/logger';
import { LifelogEntry, FetchOptions } from '../types';

// Base URL for Limitless API
const API_BASE_URL = 'https://api.limitless.ai';

// API key will be accessed directly from process.env when needed
logger.info('Initializing Limitless API client');

/**
 * Configure axios instance for Limitless API requests
 */
// Create a function to get a configured axios instance with the latest env variables
function getLimitlessApiClient() {
	return axios.create({
		baseURL: API_BASE_URL,
		headers: {
			'X-API-Key': process.env.LIMITLESS_API_KEY,
			'Content-Type': 'application/json',
		},
	});
}

interface LimitlessApiResponseData {
	lifelogs?: LifelogEntry[];
	lifelog?: LifelogEntry;
}

interface LimitlessApiResponse {
	data: LimitlessApiResponseData;
	meta?: {
		lifelogs?: {
			nextCursor: string;
			count: number;
		};
	};
}

/**
 * Fetches lifelogs from the Limitless API and stores them in the database
 */
export async function fetchAndStoreLifelogs(options: FetchOptions = {}): Promise<LifelogEntry[]> {
	try {
		const db = getDbAdapter();

		// If no specific date/range is provided, fetch since the latest entry
		if (!options.date && !options.start) {
			const latestDate = await db.getLatestEntryDate();

			if (latestDate) {
				// Set start time to latest entry date minus 1 day to ensure overlap
				const startDate = new Date(latestDate);
				startDate.setDate(startDate.getDate() - 1);
				options.start = startDate.toISOString().split('T')[0];
				logger.info(`Fetching lifelogs since ${options.start} (based on latest entry)`);
			} else {
				// If no entries exist, fetch last 7 days by default
				const startDate = new Date();
				startDate.setDate(startDate.getDate() - 7);
				options.start = startDate.toISOString().split('T')[0];
				logger.info(`No existing entries found. Fetching lifelogs since ${options.start}`);
			}
		}

		// Set timezone if not specified
		if (!options.timezone) {
			options.timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
		}

		// Build query parameters
		const params = new URLSearchParams();
		if (options.date) params.append('date', options.date);
		if (options.start) params.append('start', options.start);
		if (options.end) params.append('end', options.end);
		if (options.timezone) params.append('timezone', options.timezone);

		logger.info(`Fetching lifelogs with params: ${params.toString()}`);

		// Make API request with the latest environment variables
		const limitlessApi = getLimitlessApiClient();
		const response = await limitlessApi.get<LimitlessApiResponse>(`/v1/lifelogs?${params.toString()}`);

		if (!response.data || !response.data.data || !response.data.data.lifelogs) {
			logger.warn('Received unexpected response format from Limitless API');
			return [];
		}

		const { lifelogs } = response.data.data;
		logger.info(`Fetched ${lifelogs.length} lifelogs from Limitless API`);

		// Store each lifelog entry in the database
		const stored: LifelogEntry[] = [];
		for (const lifelog of lifelogs) {
			const wasStored = await db.saveLifelogEntry(lifelog);
			if (wasStored) {
				stored.push(lifelog);
			}
		}

		logger.info(`Stored ${stored.length} new lifelogs in the database`);
		return stored;
	} catch (error) {
		const axiosError = error as AxiosError;
		if (axiosError.response) {
			const responseData = axiosError.response.data as any;
			logger.error(
				`API Error (${axiosError.response.status}): ${responseData?.message || JSON.stringify(responseData)}`,
			);
		} else if (axiosError.request) {
			logger.error('API request failed, no response received');
		} else if (error instanceof Error) {
			logger.error('Error fetching lifelogs:', error.message);
		} else {
			logger.error('Unknown error fetching lifelogs');
		}
		throw error;
	}
}

/**
 * Fetches a specific lifelog by ID
 */
export async function fetchLifelogById(id: string): Promise<LifelogEntry | null> {
	try {
		logger.info(`Fetching lifelog with ID: ${id}`);
		const limitlessApi = getLimitlessApiClient();
		const response = await limitlessApi.get<LimitlessApiResponse>(`/v1/lifelogs/${id}`);

		if (!response.data || !response.data.data || !response.data.data.lifelog) {
			logger.warn(`Received unexpected response format for lifelog ID: ${id}`);
			return null;
		}

		return response.data.data.lifelog;
	} catch (error) {
		const axiosError = error as AxiosError;
		if (axiosError.response) {
			const responseData = axiosError.response.data as any;
			logger.error(
				`API Error (${axiosError.response.status}) fetching lifelog ${id}: ${
					responseData?.message || JSON.stringify(responseData)
				}`,
			);
		} else if (error instanceof Error) {
			logger.error(`Error fetching lifelog ${id}:`, error.message);
		} else {
			logger.error(`Unknown error fetching lifelog ${id}`);
		}
		throw error;
	}
}
