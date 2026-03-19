import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Link from 'next/link';

const spheres = [
	{
		emoji: '💼',
		title: 'Career & Business',
		desc: 'Professional growth, job satisfaction, and achievement of work goals.',
	},
	{
		emoji: '💰',
		title: 'Finance',
		desc: 'Financial security, savings, investments, and overall monetary well-being.',
	},
	{
		emoji: '❤️',
		title: 'Health & Fitness',
		desc: 'Physical vitality, exercise habits, nutrition, and energy levels.',
	},
	{
		emoji: '👨‍👩‍👧',
		title: 'Family & Relationships',
		desc: 'Quality of close relationships, intimacy, and social connections.',
	},
	{
		emoji: '🧠',
		title: 'Personal Development',
		desc: 'Learning, skills growth, mindset, and self-improvement.',
	},
	{
		emoji: '🎮',
		title: 'Fun & Recreation',
		desc: 'Hobbies, leisure time, creativity, and activities that bring joy.',
	},
	{
		emoji: '🏡',
		title: 'Physical Environment',
		desc: 'Home, workspace, surroundings, and your relationship with your space.',
	},
	{
		emoji: '🌿',
		title: 'Spirituality & Purpose',
		desc: 'Sense of meaning, values, mindfulness, and connection to something greater.',
	},
];

export default function Home() {
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
					<Link href="/register" style={{ textDecoration: 'none' }}>
						<Button variant="contained" size="large">
							Get Started — It&apos;s Free
						</Button>
					</Link>
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

			{/* 8 Spheres */}
			<Box mb={6}>
				<Typography variant="h5" fontWeight="bold" gutterBottom>
					The 8 Spheres of Life
				</Typography>
				<Grid container spacing={2}>
					{spheres.map(({ emoji, title, desc }) => (
						<Grid size={{ xs: 12, sm: 6 }} key={title}>
							<Paper variant="outlined" sx={{ p: 2.5, height: '100%' }}>
								<Typography
									variant="h5"
									component="span"
									mr={1}
									sx={{ fontSize: '1.5rem' }}
								>
									{emoji}
								</Typography>
								<Typography
									variant="subtitle1"
									fontWeight="medium"
									component="span"
								>
									{title}
								</Typography>
								<Typography
									variant="body2"
									color="text.secondary"
									mt={0.5}
									gutterBottom
								>
									{desc}
								</Typography>
							</Paper>
						</Grid>
					))}
				</Grid>
			</Box>

			{/* CTA */}
			<Box textAlign="center">
				<Typography variant="h6" gutterBottom>
					Ready to take a look at your life from above?
				</Typography>
				<Link href="/register" style={{ textDecoration: 'none' }}>
					<Button variant="contained" size="large">
						Create Your Wheel
					</Button>
				</Link>
			</Box>
		</Container>
	);
}
