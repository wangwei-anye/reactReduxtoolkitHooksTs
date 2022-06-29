const { XVIZUIBuilder } = require('@xviz/builder');

function getDeclarativeUI() {
  const builder = new XVIZUIBuilder({});

  builder.child(getMetricsPanel(builder));
  // TODO camera
  // TODO trajectory
  // TODO perception

  return builder;
}

function getMetricsPanel(builder) {
  const panel = builder.panel({
    name: 'Metrics'
  });

  const container = builder.container({
    name: 'Metrics Panel',
    layout: 'vertical'
  });

  const metricAcceleration = builder.metric({
    title: 'Acceleration(m/s^2)',
    streams: ['/vehicle/acceleration'],
    description: 'The acceleration of the vehicle'
  });

  const metricVelocity = builder.metric({
    title: 'Velocity(km/h)',
    streams: ['/vehicle/velocity'],
    description: 'The velocity of the vehicle'
  });

  const metricWheel = builder.metric({
    title: 'Heading(radian)',
    streams: ['/vehicle/wheel_angle'],
    description: 'The brake rate of the vehicle'
  });

  const metricThrottle = builder.metric({
    title: 'Throttle',
    streams: ['/vehicle/throttle'],
    description: 'The throttle of the vehicle'
  });

  const metricBrake = builder.metric({
    title: 'Brake',
    streams: ['/vehicle/brake'],
    description: 'The brake of the vehicle'
  });

  const metricSteering = builder.metric({
    title: 'Steering',
    streams: ['/vehicle/steering'],
    description: 'The steering of the vehicle'
  });

  container.child(metricAcceleration);
  container.child(metricVelocity);
  container.child(metricWheel);
  container.child(metricThrottle);
  container.child(metricBrake);
  container.child(metricSteering);
  panel.child(container);

  return panel;
}

module.exports = getDeclarativeUI;
