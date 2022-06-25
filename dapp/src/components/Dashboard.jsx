import React, {useState, useEffect} from 'react';
import { Button, Card, CardActions, CardContent, CardHeader, CardMedia, Grid, Link, Typography } from '@mui/material';
import CallMade from '@mui/icons-material/CallMade';

const Dashboard = ({version, currentUser, contract, onDeleteProject, onDonate}) => {
  const [projects, setProjects] = useState([]);
  const [loaded, setLoaded] = useState(false);
  
  useEffect(() => {
      async function fetchData() {
        const youtubeLong = /http[s]?:\/\/www\.youtube\.com\/watch\?v=(?<code>[a-zA-Z0-9]+)/;
        const youtubeShort = /http[s]?:\/\/youtu\.be\/(?<code>[a-zA-Z0-9]+)/;
        const youtubeEmbedded = /http[s]?:\/\/www\.youtube\.com\/embed\/(?<code>[a-zA-Z0-9]+)/;
        const result = await contract.get_donation_projects();
        result.forEach(p => {
           let code;
           let match;
           if((match = youtubeLong.exec(p.youtube_stream))){
            code = match.groups.code;
           } else if((match = youtubeShort.exec(p.youtube_stream))){
            code = match.groups.code;
           } else if((match = youtubeEmbedded.exec(p.youtube_stream))){
            code = match.groups.code;
           }
           p.youtube_stream = code ? `https://www.youtube.com/embed/${code}?controls=0` : '';
        });
        console.log(result);
        setProjects(result);
        setLoaded(true);
      }
      
      fetchData();
  }, [contract, currentUser]);

  if(!loaded){
    return <>
              <Typography variant="h4" component="h1" gutterBottom>
                Simple Donations - {version}
              </Typography>
              <Typography variant="h4" component="h1" gutterBottom>
                Loading...
              </Typography>
          </>
  }

  return <>
          <div className="my-4">
            <Typography variant="h4" component="h1" gutterBottom>
              Simple Donations - {version}
            </Typography>
            <Typography variant="body1" component="p" className='mt-4 mb-2'>
                This app demonstrates how blockchain technology can be used to simplyfy and
                streamline the creation of donation projects. It allows the cash to reach
                the right places without any middle-man or delay. The only requirement is
                a working internet connection.
            </Typography>
            <Typography variant="body1" component="p" className='mt-4 mb-2'>
                Everyone with a NEAR wallet can create a new donation project with a simple
                click of a button in the top left corner. The user than provides information
                that shows the donors the credibility of the project like video links and 
                website links. Donors can then simply click on any project below to donate
                to them.
            </Typography>
            <Typography variant="body1" component="p" className='mt-4 mb-2'>
                Further ideas of development are to integrate fiat conversion services so it
                is possible to donate using fiat currencies. Another idea is to provide a
                simplified view of a single project that can be embedded into any website,
                such as the donation projects homepage.
            </Typography>
            {projects.length > 0
            ? 
            <Grid container spacing={2}>
              {projects.map(project => 
                <Grid item xs={6}>
                  <Card>
                    <CardHeader title={<Link href={project.homepage} target="_blank" rel="noopener">
                                          {project.title} <CallMade />
                                      </Link>} />
                    {project.youtube_stream
                    ?
                    <CardMedia
                      component="iframe"
                      src={project.youtube_stream}
                      alt={project.title}
                      frameBorder='0'
                      height='300'
                    />
                    :
                    <CardMedia
                      component="img"
                      image='https://cdn.pixabay.com/photo/2017/06/02/19/12/broken-link-2367103_960_720.png'
                      height='300'
                    />}
                    <CardContent>
                      <Typography variant="body1" dangerouslySetInnerHTML={{__html: `${project.description.replace(/\n/g, '<br/>')}`}}/>
                    </CardContent>
                    <CardActions>
                      {project.donation_target !== currentUser.accountId ? <Button size="medium" onClick={_ => onDonate(project)}>Donate</Button> : null}
                      {project.donation_target === currentUser.accountId ? <Button size="medium" onClick={_ => onDeleteProject(project)}>Delete</Button> : null}
                    </CardActions>
                  </Card>
                </Grid>)
              }
            </Grid>
            : <p>
                  There are no active donation projects.
              </p>}
          </div>
        </>
}

export default Dashboard;