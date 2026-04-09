import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Link from 'next/link';
import SpheresRater from '@/app/components/SpheresRater';export default function Home() {
	return (
		<Container maxWidth="md" sx={{ py: 8 }}>
			{/* Hero */}
			<Box textAlign="center" mb={6}>
				<Typography variant="h3" fontWeight="bold" gutterBottom>
					Wheel of Life
				</Typography>
				<Typography
					variant="h6"
					color="text.secondary"
					maxWidth={600}
					mx="auto"
				>
					A powerful self-assessment tool that gives you a bird&apos;s-eye view of your
					life and helps you find balance across the areas that matter most.
				</Typography>
				<Box
					mt={4}
					display="flex"
					justifyContent="center"
					gap={2}
					flexWrap="wrap"
				>
					<a href="#rate-your-spheres" style={{ textDecoration: 'none' }}>
						<Button variant="contained" size="large">
							Rate Your Spheres — It&apos;s Free
						</Button>
					</a>
					<Link href="/login" style={{ textDecoration: 'none' }}>
						<Button variant="outlined" size="large">
							Sign In
						</Button>
					</Link>
				</Box>
			</Box>

			<Divider sx={{ mb: 6 }} />

			{/* What is it */}
			<Box mb={6}>
				<Typography variant="h5" fontWeight="bold" gutterBottom>
					What is the Wheel of Life?
				</Typography>
				<Typography color="text.secondary" lineHeight={1.8}>
					The <strong>Wheel of Life</strong> is a coaching and self-reflection
					methodology originally popularised by Paul J. Meyer in the 1960s. It
					divides your life into 8 key areas — called
					<em> spheres</em> — and asks you to rate your current level of
					satisfaction in each one on a scale of 1–10. The result is a visual
					&ldquo;wheel&rdquo; that instantly shows where you feel fulfilled and where there
					is room to grow.
				</Typography>
				<Typography color="text.secondary" lineHeight={1.8} mt={2}>
					By regularly revisiting your wheel, you develop a habit of honest
					self-assessment and intentional living. You stop reacting to life and
					start designing it.
				</Typography>
			</Box>

			{/* How it works */}
			<Box mb={6}>
				<Typography variant="h5" fontWeight="bold" gutterBottom>
					How It Works
				</Typography>
				<Grid container spacing={2}>
					{[
						{
							step: '1',
							title: 'Rate each sphere',
							body: 'Give an honest score from 1 (very unsatisfied) to 10 (fully thriving) for every life area.',
						},
						{
							step: '2',
							title: 'Spot the imbalance',
							body: 'A lopsided wheel shows where you are neglecting important parts of your life.',
						},
						{
							step: '3',
							title: 'Set focused goals',
							body: 'For each area that needs attention, create concrete, actionable goals.',
						},
						{
							step: '4',
							title: 'Track your tasks',
							body: 'Break goals into daily tasks and check them off to build momentum.',
						},
					].map(({ step, title, body }) => (
						<Grid size={{ xs: 12, sm: 6 }} key={step}>
							<Paper variant="outlined" sx={{ p: 3, height: '100%' }}>
								<Typography
									variant="h4"
									fontWeight="bold"
									color="primary"
									gutterBottom
								>
									{step}
								</Typography>
								<Typography fontWeight="medium" gutterBottom>
									{title}
								</Typography>
								<Typography
									variant="body2"
									color="text.secondary"
									gutterBottom
								>
									{body}
								</Typography>
							</Paper>
						</Grid>
					))}
				</Grid>
			</Box>

			{/* Interactive sphere rater */}
			<Box id="rate-your-spheres" mb={6} sx={{ scrollMarginTop: 80 }}>
				<Typography variant="h5" fontWeight="bold" gutterBottom>
					Rate Your Spheres
				</Typography>
				<Typography color="text.secondary" lineHeight={1.8} mb={3}>
					Give each area of your life an honest score right now. You can also rename any sphere to better reflect your own life.
				</Typography>
				<SpheresRater />
				<Box textAlign="center" mt={3}>
					<Link href="/register" style={{ textDecoration: 'none' }}>
						<Button variant="contained" size="large">
							Save your ratings and create a wheel
						</Button>
					</Link>
				</Box>
			</Box>

			{/* CTA */}
			{/*<Box textAlign="center">*/}
			{/*	<Typography variant="h6" gutterBottom>*/}
			{/*		Ready to take a look at your life from above?*/}
			{/*	</Typography>*/}
			{/*	<Link href="/register" style={{ textDecoration: 'none' }}>*/}
			{/*		<Button variant="contained" size="large">*/}
			{/*			Rate Your Spheres*/}
			{/*		</Button>*/}
			{/*	</Link>*/}
			{/*</Box>*/}
		</Container>
	);
}
