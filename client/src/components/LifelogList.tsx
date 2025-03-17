import React, { ReactElement } from 'react';
import { Paper, Typography, Box, Divider, Chip, Grid } from '@mui/material';

interface LifelogEntry {
	id: string;
	userId: string;
	content: Record<string, any>;
	timestamp: string;
	parsed: boolean;
	parseAttempts: number;
	created_at: string;
}

interface LifelogListProps {
	lifelogs: LifelogEntry[];
}

function LifelogList({ lifelogs }: LifelogListProps): ReactElement {
	console.log(lifelogs);

	if (lifelogs.length === 0) {
		return (
			<Paper sx={{ p: 3, mt: 3 }}>
				<Typography variant='h5' gutterBottom>
					Recent Lifelogs
				</Typography>
				<Typography variant='body1' color='text.secondary'>
					No lifelogs found. Try triggering a data ingestion.
				</Typography>
			</Paper>
		);
	}

	return (
		<Paper sx={{ p: 3, mt: 3 }}>
			<Typography variant='h5' gutterBottom>
				Recent Lifelogs
			</Typography>
			<Typography variant='body2' color='text.secondary' sx={{ mb: 2 }}>
				Showing {lifelogs.length} most recent entries
			</Typography>

			{lifelogs.map((log, index) => (
				<Box key={log.id} sx={{ mb: 3 }}>
					{index > 0 && <Divider sx={{ my: 2 }} />}

					<Grid container spacing={2}>
						<Grid item xs={12}>
							<Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
								<Typography variant='subtitle1' fontWeight='bold'>
									{log.timestamp
										? (() => {
												try {
													const date = new Date(log.created_at);
													return isNaN(date.getTime())
														? 'Invalid Date'
														: date.toLocaleString();
												} catch (e) {
													return 'Invalid Date';
												}
										  })()
										: 'Invalid Date'}
								</Typography>
								<Chip
									label={log.parsed ? 'Parsed' : 'Unparsed'}
									color={log.parsed ? 'success' : 'warning'}
									size='small'
									variant='outlined'
								/>
							</Box>
						</Grid>

						<Grid item xs={12}>
							<Typography variant='body2' color='text.secondary' sx={{ mb: 1 }}>
								ID: {log.id}
							</Typography>

							<Paper variant='outlined' sx={{ p: 2, bgcolor: 'background.default' }}>
								<pre style={{ margin: 0, overflow: 'auto', maxHeight: '200px' }}>
									{JSON.stringify(log.content, null, 2)}
								</pre>
							</Paper>
						</Grid>

						<Grid item xs={12}>
							<Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
								<Typography variant='caption' color='text.secondary'>
									Created:{' '}
									{log.created_at
										? (() => {
												try {
													const date = new Date(log.created_at);
													return isNaN(date.getTime())
														? 'Invalid Date'
														: date.toLocaleString();
												} catch (e) {
													return 'Invalid Date';
												}
										  })()
										: 'Invalid Date'}
								</Typography>
								{log.parseAttempts > 0 && (
									<Typography variant='caption' color='text.secondary'>
										Parse attempts: {log.parseAttempts}
									</Typography>
								)}
							</Box>
						</Grid>
					</Grid>
				</Box>
			))}
		</Paper>
	);
}

export default LifelogList;
