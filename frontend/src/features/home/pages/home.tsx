import { Box, Button, Chip, Divider, Link, Paper, Stack, Typography } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import GitHubIcon from '@mui/icons-material/GitHub';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import PendingActionsIcon from '@mui/icons-material/PendingActions';
import SyncIcon from '@mui/icons-material/Sync';
import TerminalIcon from '@mui/icons-material/Terminal';

const repository = 'https://github.com/PedroFaria14/AsyncRunner';
const steps = [
  {
    title: 'Crie uma tarefa',
    description: 'Defina um nome e escolha a prioridade do job no dashboard.',
  },
  {
    title: 'Entre na fila',
    description: 'O job aguarda sua vez. Prioridades mais altas são selecionadas primeiro.',
  },
  {
    title: 'Execute em background',
    description: 'O worker processa a tarefa sem manter uma requisição HTTP aberta.',
  },
  {
    title: 'Acompanhe o resultado',
    description: 'Consulte o status e as tentativas pela interface, atualizada automaticamente.',
  },
];
const capabilities = [
  {
    title: 'Prioridade e tentativas',
    description:
      'Seleção de jobs por prioridade e limite de três tentativas quando o executor falha.',
  },
  {
    title: 'Visibilidade do processamento',
    description: 'Status, tentativas e logs estruturados para entender o ciclo de cada job.',
  },
  {
    title: 'Engenharia além da interface',
    description: 'Testes automatizados, contrato OpenAPI, webhooks, Docker e integração contínua.',
  },
];

function ExecutionPreview() {
  const states = [
    { name: 'Na fila', description: 'Aguardando o worker', Icon: PendingActionsIcon },
    { name: 'Processando', description: 'Execução em segundo plano', Icon: SyncIcon },
    { name: 'Concluído', description: 'Resultado disponível', Icon: CheckCircleOutlineIcon },
  ];
  return (
    <Paper
      component="figure"
      aria-label="Exemplo ilustrativo do ciclo de um job"
      sx={{
        m: 0,
        p: { xs: 2.5, sm: 3.5 },
        bgcolor: 'primary.dark',
        color: 'primary.contrastText',
        borderRadius: 3,
      }}
    >
      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 3 }}>
        <TerminalIcon fontSize="small" aria-hidden="true" />
        <Typography
          component="span"
          variant="overline"
          sx={{ letterSpacing: '0.08em', fontWeight: 600 }}
        >
          Do envio ao resultado
        </Typography>
      </Stack>
      <Box
        sx={{
          p: 2,
          border: '1px solid',
          borderColor: 'rgba(255,255,255,0.22)',
          borderRadius: 2,
          mb: 3,
        }}
      >
        <Typography component="code" variant="caption" sx={{ color: '#d4e3ff' }}>
          POST /jobs
        </Typography>
        <Typography sx={{ fontWeight: 650, mt: 0.5 }}>Gerar relatório mensal</Typography>
        <Typography variant="body2" sx={{ color: '#d4e3ff', mt: 0.5 }}>
          Prioridade alta · até 3 tentativas
        </Typography>
      </Box>
      <Stack component="ol" spacing={0} sx={{ listStyle: 'none', p: 0, m: 0 }}>
        {states.map(({ name, description, Icon }, index) => (
          <Box component="li" key={name} sx={{ display: 'flex', gap: 2 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <Box
                sx={{
                  width: 36,
                  height: 36,
                  display: 'grid',
                  placeItems: 'center',
                  borderRadius: '50%',
                  bgcolor: 'rgba(255,255,255,0.12)',
                }}
              >
                <Icon fontSize="small" aria-hidden="true" />
              </Box>
              {index < states.length - 1 && (
                <Box
                  sx={{
                    width: '1px',
                    minHeight: 24,
                    flexGrow: 1,
                    bgcolor: 'rgba(255,255,255,0.24)',
                    my: 0.5,
                  }}
                />
              )}
            </Box>
            <Box sx={{ pb: index < states.length - 1 ? 3 : 0 }}>
              <Typography sx={{ fontWeight: 600 }}>{name}</Typography>
              <Typography variant="body2" sx={{ color: '#d4e3ff' }}>
                {description}
              </Typography>
            </Box>
          </Box>
        ))}
      </Stack>
      <Typography
        component="figcaption"
        variant="caption"
        sx={{ display: 'block', color: '#d4e3ff', mt: 3 }}
      >
        Fluxo ilustrativo. Experimente uma execução real no dashboard.
      </Typography>
    </Paper>
  );
}

export function HomePage() {
  return (
    <Stack spacing={{ xs: 6, md: 9 }}>
      <Box
        component="section"
        aria-labelledby="home-title"
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: '1.15fr 1fr' },
          alignItems: 'center',
          gap: { xs: 4, md: 7 },
          pt: { xs: 1, md: 3 },
        }}
      >
        <Box>
          <Typography
            variant="overline"
            color="primary.main"
            sx={{ fontWeight: 700, letterSpacing: '0.12em' }}
          >
            AsyncFlow · projeto full-stack
          </Typography>
          <Typography
            id="home-title"
            component="h1"
            sx={{
              fontSize: { xs: '2.125rem', sm: '2.8rem', lg: '3.25rem' },
              lineHeight: 1.1,
              letterSpacing: '-0.045em',
              fontWeight: 750,
              mt: 1,
              mb: 3,
            }}
          >
            Entenda o caminho de uma tarefa em segundo plano.
          </Typography>
          <Typography
            color="text.secondary"
            sx={{ fontSize: '1.0625rem', lineHeight: 1.8, maxWidth: 560 }}
          >
            Da criação ao resultado: uma aplicação para explorar jobs assíncronos, prioridades e
            tentativas de execução, com uma API em Go e um dashboard em React.
          </Typography>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ mt: 3.5 }}>
            <Button
              component={RouterLink}
              to="/dashboard"
              variant="contained"
              size="large"
              endIcon={<ArrowForwardIcon />}
            >
              Experimentar o dashboard
            </Button>
            <Button
              component="a"
              href={repository}
              target="_blank"
              rel="noopener noreferrer"
              variant="outlined"
              size="large"
              startIcon={<GitHubIcon />}
            >
              Ver código no GitHub
            </Button>
          </Stack>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            Um laboratório de engenharia de software. Sem cadastro para experimentar.
          </Typography>
        </Box>
        <ExecutionPreview />
      </Box>

      <Box
        component="section"
        aria-labelledby="how-title"
        id="como-funciona"
        sx={{ scrollMarginTop: 24 }}
      >
        <Typography
          variant="overline"
          color="primary.main"
          sx={{ fontWeight: 700, letterSpacing: '0.1em' }}
        >
          Um ciclo, quatro etapas
        </Typography>
        <Typography id="how-title" component="h2" variant="h4" sx={{ mt: 0.5, mb: 1 }}>
          Como funciona
        </Typography>
        <Typography color="text.secondary" sx={{ mb: 3.5 }}>
          A interface envia a tarefa. O backend cuida do processamento.
        </Typography>
        <Box
          component="ol"
          sx={{
            listStyle: 'none',
            p: 0,
            m: 0,
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              sm: 'repeat(2, minmax(0, 1fr))',
              md: 'repeat(4, minmax(0, 1fr))',
            },
            gap: 3,
          }}
        >
          {steps.map(({ title, description }, index) => (
            <Box
              component="li"
              key={title}
              sx={{ borderTop: '2px solid', borderColor: 'divider', pt: 2.5 }}
            >
              <Typography variant="overline" color="primary.main" sx={{ fontWeight: 700 }}>
                {String(index + 1).padStart(2, '0')}
              </Typography>
              <Typography component="h3" variant="h6" sx={{ mt: 0.5, mb: 1 }}>
                {title}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.8 }}>
                {description}
              </Typography>
            </Box>
          ))}
        </Box>
      </Box>

      <Paper
        component="section"
        aria-labelledby="about-title"
        variant="outlined"
        sx={{
          p: { xs: 2.5, sm: 4, md: 5 },
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
          gap: { xs: 4, md: 6 },
        }}
      >
        <Box>
          <Typography
            variant="overline"
            color="primary.main"
            sx={{ fontWeight: 700, letterSpacing: '0.1em' }}
          >
            Construído para aprender
          </Typography>
          <Typography id="about-title" component="h2" variant="h4" sx={{ mt: 0.5, mb: 2 }}>
            Sobre o projeto
          </Typography>
          <Typography color="text.secondary" sx={{ lineHeight: 1.8 }}>
            O AsyncFlow é um projeto de estudo e portfólio que conecta conceitos de backend e
            frontend em uma demonstração prática de processamento assíncrono.
          </Typography>
          <Typography color="text.secondary" sx={{ mt: 1.5, mb: 3, lineHeight: 1.8 }}>
            O executor demonstrativo simula uma tarefa. O objetivo é tornar visíveis a organização
            da fila, as transições de estado e as decisões de engenharia que sustentam esse fluxo.
          </Typography>
          <Stack
            direction="row"
            useFlexGap
            flexWrap="wrap"
            gap={1}
            aria-label="Tecnologias do projeto"
          >
            {['Go', 'React', 'TypeScript', 'MUI', 'React Query', 'Docker', 'GitHub Actions'].map(
              (technology) => (
                <Chip key={technology} label={technology} variant="outlined" size="small" />
              ),
            )}
          </Stack>
        </Box>
        <Stack spacing={3} justifyContent="center">
          {capabilities.map(({ title, description }) => (
            <Stack direction="row" gap={1.5} key={title}>
              <CheckCircleOutlineIcon color="primary" sx={{ mt: 0.3 }} aria-hidden="true" />
              <Box>
                <Typography component="h3" variant="h6" sx={{ mb: 0.75 }}>
                  {title}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.8 }}>
                  {description}
                </Typography>
              </Box>
            </Stack>
          ))}
        </Stack>
      </Paper>

      <Box
        component="section"
        aria-labelledby="try-title"
        sx={{ textAlign: 'center', maxWidth: 720, alignSelf: 'center', width: '100%' }}
      >
        <Typography id="try-title" component="h2" variant="h4" sx={{ mb: 1.5 }}>
          Sua primeira tarefa começa aqui.
        </Typography>
        <Typography color="text.secondary" sx={{ mb: 3, lineHeight: 1.8 }}>
          Abra o dashboard, dê um nome ao job e escolha a prioridade. Acompanhe a execução e veja o
          resultado sem sair da página.
        </Typography>
        <Button
          component={RouterLink}
          to="/dashboard"
          variant="contained"
          size="large"
          endIcon={<ArrowForwardIcon />}
        >
          Abrir dashboard
        </Button>
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ display: 'block', mt: 2.5, lineHeight: 1.7 }}
        >
          Ambiente de demonstração: jobs e assinaturas de webhooks ficam em memória e podem ser
          perdidos quando o backend reinicia.
        </Typography>
      </Box>

      <Box component="footer">
        <Divider sx={{ mb: 2.5 }} />
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          justifyContent="space-between"
          gap={1.5}
          sx={{ pb: 1 }}
        >
          <Typography variant="body2" color="text.secondary">
            AsyncFlow · do conceito à execução.
          </Typography>
          <Link href={repository} target="_blank" rel="noopener noreferrer" variant="body2">
            Explore o projeto no GitHub
          </Link>
        </Stack>
      </Box>
    </Stack>
  );
}
